/** @prettier */
import { forwardRef, Inject, Injectable, NotFoundException, NotImplementedException, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendsService } from 'src/friends/friends.service';
import { User } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { InsertResult, Repository, SelectQueryBuilder } from 'typeorm';
import { NotificationAction } from './entity/notification-action.entity';
import { NotificationFront } from './entity/notification-front.entity';
import { Notification, NotificationType } from './entity/notification.entity';

@Injectable()
export class NotificationService {

	@Inject(forwardRef(() => FriendsService))
	private readonly friendService: FriendsService;
	@Inject(UsersService)
	private readonly userService: UsersService;
	
	constructor(@InjectRepository(Notification) private notifsRepository: Repository<Notification>) {}

	public async addNotif(notif: Notification): Promise<InsertResult> {
		return await this.notifsRepository.insert(notif);
	}

	public async findMany(userId: number): Promise<NotificationFront[]> {
		const sqlStatement: SelectQueryBuilder<Notification> = this.notifsRepository.createQueryBuilder('notif');

		sqlStatement.where('notif.user_id = :user_id', { user_id: userId });
		sqlStatement.andWhere('notif.is_deleted IS NOT TRUE');
		sqlStatement.orderBy('notif.id', 'DESC', 'NULLS LAST');
		return await sqlStatement.getMany().then(async (notifs: Notification[]) => {
			const allNotifsFront: NotificationFront[] = new Array();
			for (let notif of notifs) {
				const notifFront: NotificationFront = new NotificationFront();
				const target: User = await this.userService.findOne(notif.from_user_id);
				notifFront.id = notif.id;
				notifFront.from_user_id = notif.from_user_id;
				if (notif.type === NotificationType.FRIEND_REQUEST) {
					notifFront.message = `Friend request from ${target.username}.`;
				} else if (notif.type === NotificationType.MATCH_REQUEST) {
					notifFront.message = `Game request from ${target.username}.`;
				}
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
