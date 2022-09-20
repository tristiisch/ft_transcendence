/** @prettier */
import { forwardRef, Inject, Injectable, NotFoundException, NotImplementedException, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendsService } from '../friends/friends.service';
import { User } from '../users/entity/user.entity';
import { UsersService } from '../users/users.service';
import { InsertResult, Repository, SelectQueryBuilder, UpdateQueryBuilder, UpdateResult } from 'typeorm';
import { NotificationAction } from './entity/notification-action.entity';
import { Notification, NotificationFront, NotificationType } from './entity/notification.entity';

@Injectable()
export class NotificationService {


	constructor(
		@InjectRepository(Notification)
		private notifsRepository: Repository<Notification>,
		@Inject(forwardRef(() => FriendsService))
		private readonly friendService: FriendsService,
		@Inject(forwardRef(() => UsersService))
		private readonly userService: UsersService,
	) {}

	public async addNotif(notif: Notification): Promise<Notification> {
		return await this.notifsRepository.save(notif);
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

	async action(user: User, notifAction: NotificationAction): Promise<boolean> {
		const notif: Notification = await this.notifsRepository.findOneBy({ id: notifAction.id });
		if (!notif)
			throw new NotFoundException(`Unable to find notification n°${notifAction.id}.`);
		const target: User = await this.userService.findOne(notif.from_user_id);

		if (notif.type === NotificationType.FRIEND_REQUEST) {
			if (notifAction.accept) {
				await this.friendService.acceptFriendRequest(user, target);
			} else {
				await this.friendService.removeFriendship(user, target)
			}
		} else if (notif.type === NotificationType.MATCH_REQUEST) {

		}
		notif.is_deleted = true;
		this.notifsRepository.update(notif.id, { is_deleted: notif.is_deleted });
		return true;
	}
}
