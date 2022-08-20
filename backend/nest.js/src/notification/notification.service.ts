/** @prettier */
import { forwardRef, Inject, Injectable, NotImplementedException, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendsService } from 'src/friends/friends.service';
import { User } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { InsertResult, Repository } from 'typeorm';
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

	// TODO sort notifications
	public async findMany(userId: number): Promise<Notification[]> {
		return await this.notifsRepository.findBy({ user_id: userId });
	}
}
