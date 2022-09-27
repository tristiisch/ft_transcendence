/** @prettier */
import { forwardRef, Inject, Injectable, NotAcceptableException, NotFoundException, NotImplementedException, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendsService } from 'friends/friends.service';
import { User } from 'users/entity/user.entity';
import { UsersService } from 'users/users.service';
import { DeleteQueryBuilder, DeleteResult, InsertResult, Repository, SelectQueryBuilder, UpdateQueryBuilder, UpdateResult } from 'typeorm';
import { NotificationAction } from './entity/notification-action.entity';
import { Notification, NotificationFront, NotificationType } from './entity/notification.entity';
import { MatchService } from 'game/matchs/matchs.service';

@Injectable()
export class NotificationService {


	constructor(
		@InjectRepository(Notification)
		private notifsRepository: Repository<Notification>,
		@Inject(forwardRef(() => FriendsService))
		private readonly friendService: FriendsService,
		@Inject(forwardRef(() => UsersService))
		private readonly userService: UsersService,
		@Inject(forwardRef(() => MatchService))
		private readonly matchstatsService: MatchService,
	) {}

	public async addNotif(notif: Notification): Promise<Notification> {
		return await this.notifsRepository.save(notif);
	}

	/**
	 * @Deprecated
	 */
	public async removeNotifFriendRequest(user1: User, user2: User): Promise<DeleteResult> {
		const sqlStatement: DeleteQueryBuilder<Notification> = this.notifsRepository.createQueryBuilder('notification').delete();

		sqlStatement.where('notification.user_id = :user_id1', { user_id1: user1.id });
		sqlStatement.andWhere('notification.from_user_id = :user_id2', { user_id2: user2.id });
		sqlStatement.orWhere('notification.user_id = :user_id2');
		sqlStatement.andWhere('notification.from_user_id = :user_id1');
		sqlStatement.andWhere('notification.is_deleted IS NOT TRUE');
		sqlStatement.andWhere(`notification.type <> '${NotificationType.FRIEND_REQUEST}'`);
	
		return await sqlStatement.execute();
	}

	public async removeNotifMatchRequest(inviteUser: User, invitedUser: User): Promise<DeleteResult> {
		const sqlStatement: DeleteQueryBuilder<Notification> = this.notifsRepository.createQueryBuilder('notification').delete();

		sqlStatement.where('notification.user_id = :invitedUser_id', { invitedUser_id: invitedUser.id });
		sqlStatement.andWhere('notification.from_user_id = :inviteUser_id', { inviteUser_id: inviteUser.id });
		sqlStatement.andWhere('notification.is_deleted IS NOT TRUE');
		sqlStatement.andWhere(`notification.type <> '${NotificationType.MATCH_REQUEST}'`);
	
		return await sqlStatement.execute();
	}

	public async deleteTempNotifs(user: User): Promise<UpdateResult> {
		const sqlStatement: UpdateQueryBuilder<Notification> = this.notifsRepository.createQueryBuilder('notification').update(Notification);

		sqlStatement.where('notification.user_id = :user_id', { user_id: user.id });
		sqlStatement.andWhere('notification.is_deleted IS NOT TRUE');
		sqlStatement.andWhere(`notification.type <> '${NotificationType.FRIEND_REQUEST}'`);
		sqlStatement.andWhere(`notification.type <> '${NotificationType.MATCH_REQUEST}'`);
	
		sqlStatement.set({ is_deleted: true });

		return await sqlStatement.execute();
	}

	public async findMany(userId: number): Promise<NotificationFront[]> {
		const sqlStatement: SelectQueryBuilder<Notification> = this.notifsRepository.createQueryBuilder('notification');

		sqlStatement.where('notification.user_id = :user_id', { user_id: userId });
		sqlStatement.andWhere('notification.is_deleted IS NOT TRUE');
		sqlStatement.orderBy('notification.id', 'DESC', 'NULLS LAST');
		return await sqlStatement.getMany().then(async (notifs: Notification[]) => {
			const allNotifsFront: NotificationFront[] = new Array();
			const userCaches: User[] = new Array();
			for (const notif of notifs) {
				const notifFront: NotificationFront = await notif.toFront(this.userService, userCaches);
				allNotifsFront.push(notifFront);
				notifFront.date = notif.date.toDateString();
				notifFront.type = notif.type;
			}
			return allNotifsFront;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	async action(user: User, notifAction: NotificationAction): Promise<any> {
		const notif: Notification = await this.notifsRepository.findOneBy({ id: notifAction.id });
		if (!notif)
			throw new NotFoundException(`Unable to find notification n°${notifAction.id}.`);
		const target: User = await this.userService.findOne(notif.from_user_id);

		let ret: any;

		if (user.isBlockedUser(target.id)) {
			throw new NotAcceptableException(`You have blocked ${target.username}. You can't do this.`);
		}

		if (notif.type === NotificationType.FRIEND_REQUEST) {
			if (notifAction.accept) {
				await this.friendService.acceptFriendRequest(user, target);
			} else {
				try {
					await this.friendService.declineFriendShip(user, target)
				} catch (err) {
					if (!(err instanceof NotAcceptableException)) {
						throw err;
					}
				}
			}
		} else if (notif.type === NotificationType.MATCH_REQUEST) {
			if (notifAction.accept) {
				ret = await this.matchstatsService.acceptInvitation(user, target);
			} else {
				try {
					await this.matchstatsService.declineInvitation(user, target);
				} catch (err) {
					if (!(err instanceof NotAcceptableException)) {
						throw err;
					}
				}
			}
		}
		notif.is_deleted = true;
		this.notifsRepository.update(notif.id, { is_deleted: notif.is_deleted });
		return ret;
	}
}
