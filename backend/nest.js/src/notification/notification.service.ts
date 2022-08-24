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

	private notifActions = new Map<NotificationType, { (notif: Notification, user: User, isAccepted: boolean): Promise<boolean> }>();
	@Inject(forwardRef(() => FriendsService))
	private readonly friendService: FriendsService;
	@Inject(UsersService)
	private readonly userService: UsersService;

	constructor(@InjectRepository(Notification) private notifsRepository: Repository<Notification>) {
		this.notifActions.set(NotificationType.FRIEND_REQUEST, async (notif: Notification, user: User, isAccepted: boolean) => {
			const target: User = await this.userService.findOne(notif.from_user_id);
			if (isAccepted) {
				this.friendService.acceptFriendRequest(user, target);
			} else {
				this.friendService.removeFriendship(user, target)
			}
			console.log('notifActions', user.username, 'launch funcFriends = ', isAccepted);
			return true;
		});
		this.notifActions.set(NotificationType.MATCH_REQUEST, async (notif: Notification, user: User, isAccepted: boolean) => {
			// notif.arguments[0] // should be user who did this request
			if (isAccepted) {
			} else {
			}
			console.log('notifActions', user.username, 'launch funcMatch = ', isAccepted);
			return true;
		});
	}

	public getNotif(type: NotificationType): { (notif: Notification, user: User, isAccepted: boolean): Promise<boolean> } {
		if (!type) throw new PreconditionFailedException('Argument NotificationType is null.');
		const func = this.notifActions.get(type);
		if (!func) throw new NotImplementedException(`The feature of notifiction ${type.toString} is not implemented yet.`);
		return func;
	}

	public async addNotif(notif: Notification): Promise<InsertResult> {
		return await this.notifsRepository.insert(notif);
	}

	public async findMany(userId: number): Promise<NotificationFront[]> {
		const sqlStatement: SelectQueryBuilder<Notification> = this.notifsRepository.createQueryBuilder('notif');

		sqlStatement.orderBy('notif.id', 'DESC', 'NULLS LAST');
		return await sqlStatement.getMany().then(async (notifs: Notification[]) => {
			const allNotifsFront: NotificationFront[] = new Array();
			for (let notif of notifs) {
				const notifFront: NotificationFront = new NotificationFront();
				const target: User = await this.userService.findOne(notif.from_user_id);
				notifFront.id = notif.id;
				notifFront.user_id = notif.user_id;
				if (notif.type === NotificationType.FRIEND_REQUEST) {
					notifFront.message = `${notif.from_user_id} sent you a friend request.`;
				} else if (notif.type === NotificationType.MATCH_REQUEST) {
					notifFront.message = `${notif.from_user_id} wants to play Pong with you.`;
				}
				allNotifsFront.push(notifFront);
			}
			return allNotifsFront;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	async action(user: User, notifAction: NotificationAction): Promise<boolean> {
		const notif: Notification = await this.notifsRepository.findOneBy({ id: notifAction.id });
		if (!notif)
			throw new NotFoundException(`Unable to find notification n°${notifAction.id}.`);
		const func = this.notifActions.get(notif.type);
		return func.call(null, notif, user, notifAction.accept);
	}
}
