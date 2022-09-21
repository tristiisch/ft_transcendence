/** @prettier */
import { forwardRef, Inject, Injectable, InternalServerErrorException, NotAcceptableException, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification, NotificationFront, NotificationType } from 'notification/entity/notification.entity';
import { NotificationService } from 'notification/notification.service';
import { UserSelectDTO } from 'users/entity/user-select.dto';
import { User } from 'users/entity/user.entity';
import { UsersService } from 'users/users.service';
import { Brackets, DeleteResult, InsertResult, RemoveOptions, Repository, SaveOptions, SelectQueryBuilder } from 'typeorm';
import { Friendship, FriendshipStatus } from './entity/friendship.entity';
import { SocketService } from 'socket/socket.service';

@Injectable()
export class FriendsService {
	constructor(
		@InjectRepository(Friendship)
		private friendsRepository: Repository<Friendship>
	) {}

	@Inject(forwardRef(() => UsersService))
	private readonly userService: UsersService;
	@Inject(NotificationService)
	private readonly notifService: NotificationService;
	@Inject(forwardRef(() => SocketService))
	private readonly socketService: SocketService;

	public getRepo() {
		return this.friendsRepository;
	}

	/**
	 * Add a friend request.
	 *
	 * @param user is the user who ask for friendship.
	 * @param target is the user who receives the request.
	 * @return A confimation message
	 *
	 * @throws {PreconditionFailedException} When {@link user} is same user as {@link target}.
	 * @throws {NotAcceptableException} When they are already friends or waiting for one of them to accept a friend request.
	 * @throws {ServiceUnavailableException} When database is not reachable or an error occurred during the SQL query.
	 */
	async addFriendRequest(user: User, target: User): Promise<{ statusCode: number; message: string }> {
		if (user.id == target.id) throw new PreconditionFailedException("You can't be friends with yourself.");

		if (user.isBlockedUser(target.id)) {
			throw new NotAcceptableException(`You have blocked ${target}. You can't add him as friends.`);
		} else if (target.isBlockedUser(user.id)) {
			throw new NotAcceptableException(`You are blocked by ${target}. You can't add him as friends.`);
		}

		const friendshipCheck: Friendship = await this.findOne(user.id, target.id, false);

		if (friendshipCheck !== null) {
			throw new NotAcceptableException(`They is already a relation between ${user.username} and ${target.username}` + ` with status ${FriendshipStatus[friendshipCheck.status]}.`);
		}
		const friendship: Friendship = new Friendship();

		friendship.user1_id = user.id;
		friendship.user2_id = target.id;

		return await this.friendsRepository.insert(friendship).then(async (insertResult: InsertResult) => {
			if (insertResult.identifiers.length < 1) {
				throw new InternalServerErrorException(`Can't add friendship of ${friendship.user1_id} and ${friendship.user1_id}.`);
			} else if (insertResult.identifiers.length > 1) {
				throw new InternalServerErrorException(insertResult.identifiers.length + ' rows was modify instead of one.');
			}
			let notif: Notification = new Notification();
			notif.user_id = friendship.user2_id;
			notif.from_user_id = friendship.user1_id;
			notif.type = NotificationType.FRIEND_REQUEST;
			notif = await this.notifService.addNotif(notif);
			this.socketService.FriendRequest(target.id, await notif.toFront(this.userService, [user, target]));
			return { statusCode: 200, user: target, message: `You asked as a friend ${target.username}.` };
		}, this.userService.lambdaDatabaseUnvailable);
	}

	/**
	 * Accept a friend request.
	 *
	 * @param user is the user who accepts the request.
	 * @param target is the user who ask for friendship.
	 * @return A confimation message
	 *
	 * @throws {PreconditionFailedException} When {@link user} is same user as {@link target}.
	 * @throws {NotAcceptableException} When they are already friends or waiting for one of them to accept a friend request.
	 * @throws {ServiceUnavailableException} When database is not reachable or an error occurred during the SQL query.
	 */
	async acceptFriendRequest(user: User, target: User): Promise<{ statusCode: number; message: string }> {
		if (target.id == user.id) throw new PreconditionFailedException("You can't be friends with yourself.");
		const friendship: Friendship = await this.findOne(target.id, user.id, true);

		if (user.isBlockedUser(target.id)) {
			throw new NotAcceptableException(`You have blocked ${target}. You can't add him as friends.`);
		} else if (target.isBlockedUser(user.id)) {
			throw new NotAcceptableException(`You are blocked by ${target}. You can't add him as friends.`);
		}
		if (friendship === null) throw new NotAcceptableException(`${user.username} has no friend request from ${target.username}.`);

		if (friendship.status == FriendshipStatus.ACCEPTED) throw new NotAcceptableException(`You are already friend with ${target.username}.`);

		friendship.status = FriendshipStatus.ACCEPTED;

		let notif: Notification = new Notification();
		notif.user_id = friendship.user1_id;
		notif.from_user_id = friendship.user2_id;
		notif.type = NotificationType.FRIEND_ACCEPT;
		notif = await this.notifService.addNotif(notif);
		this.socketService.AddFriend(target.id, await notif.toFront(this.userService, [user, target]));
		return await this.friendsRepository.save(friendship).then((fs: Friendship) => {
			return { statusCode: 200, user: target, message: `You are now friend with ${target.username}.` };
		}, this.userService.lambdaDatabaseUnvailable);
	}

	/**
	 * Remove a relation (friend request or friend relation). Order of params changed only confirmation message.
	 *
	 * @return A confirmation message.
	 *
	 * @throws {PreconditionFailedException} When {@link user} is same user as {@link target}.
	 * @throws {NotAcceptableException} When there is no pending friendship request or a confirmed friendship.
	 * @throws {InternalServerErrorException} When the value in database can't be changed.
	 * @throws {ServiceUnavailableException} When database is not reachable or an error occurred during the SQL query.
	 */
	async removeFriendship(user: User, target: User): Promise<{ statusCode: number; message: string }> {
		if (target.id == user.id) throw new PreconditionFailedException('Unable to suppress a friendship with oneself.');

		const friendship: Friendship = await this.findOne(user.id, target.id, false);

		if (friendship === null) {
			throw new NotAcceptableException(`You are not friends with ${target.username}.`);
		}

		// TODO delete notif friends

		/*let notif: Notification = new Notification();
		notif.user_id = friendship.user1_id;
		notif.from_user_id = friendship.user2_id;
		notif.type = NotificationType.FRIEND_DECLINE;
		notif = await this.notifService.addNotif(notif);*/
		this.socketService.RemoveFriend(user.id, target.id);

		return await this.friendsRepository.delete({ id: friendship.id }).then((value: DeleteResult) => {
			if (!value.affected || value.affected == 0) throw new InternalServerErrorException(`Can't remove friendship of ${friendship.user1_id} and ${friendship.user2_id}.`);
			else return { statusCode: 200, user: target, message: `You are no longer friends with ${target.username}.` };
		}, this.userService.lambdaDatabaseUnvailable);
	}

	/**
	 * Find a {@link Friendship} with the two users concerned.
	 *
	 * @param user1 is the user who originally requested the friendship if {@link strict} is true.
	 * @param user2 is the user who originally receives the request if {@link strict} is true.
	 * @param strict strict must be set to true if the order of the parameters is important. Otherwise it must be false.
	 * @return The {@link Friendship} find with theses parameters.
	 *
	 * @throws {ServiceUnavailableException} When database is not reachable or an error occurred during the SQL query.
	 */
	private async findOne(user1: number, user2: number, strict: boolean): Promise<Friendship> {
		const sqlStatement: SelectQueryBuilder<Friendship> = this.friendsRepository.createQueryBuilder('friendship');

		sqlStatement.where('friendship.user1_id = :id1', { id1: user1 }).andWhere('friendship.user2_id = :id2', { id2: user2 });
		if (!strict) {
			sqlStatement.orWhere('friendship.user1_id = :id2').andWhere('friendship.user2_id = :id1');
		}

		return await sqlStatement.getOne().then((friendship: Friendship) => {
			return friendship;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	/**
	 * A pending invitation is when you make a friend request and you are waiting for its validation
	 *
	 * @throws {ServiceUnavailableException} When database is not reachable or an error occurred during the SQL query.
	 */
	async findPendingIds(userId: number): Promise<number[]> {
		const sqlStatement: SelectQueryBuilder<Friendship> = this.friendsRepository.createQueryBuilder('friendship');

		// await this.userService.findOne(userId);
		sqlStatement.where('friendship.user1_id = :id', { id: userId }).andWhere('friendship.status = :status', { status: FriendshipStatus.PENDING });

		return await sqlStatement.getMany().then((friendships: Friendship[]) => {
			const friends: number[] = new Array();

			friendships.forEach((fs) => {
				if (fs.user1_id != userId) friends.push(fs.user1_id);
				else friends.push(fs.user2_id);
			});
			return friends;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	async findPending(userId: number): Promise<User[]> {
		return await Promise.all(
			(
				await this.findPendingIds(userId)
			).map(async (friendId) => {
				return await this.userService.findOne(friendId);
			})
		);
	}

	async findPendingNames(userId: number): Promise<string[]> {
		return (await this.findPending(userId)).map((friend) => friend.username);
	}

	/**
	 * A waiting invitation is when someone has asked you as a friend and is waiting for your answer
	 */
	async findWaitingIds(userId: number): Promise<number[]> {
		const sqlStatement: SelectQueryBuilder<Friendship> = this.friendsRepository.createQueryBuilder('friendship');

		// await this.userService.findOne(userId);
		sqlStatement.where('friendship.user2_id = :id', { id: userId }).andWhere('friendship.status = :status', { status: FriendshipStatus.PENDING });

		return await sqlStatement.getMany().then((friendships: Friendship[]) => {
			const friends: number[] = new Array();

			friendships.forEach((fs) => {
				if (fs.user1_id != userId) friends.push(fs.user1_id);
				else friends.push(fs.user2_id);
			});
			return friends;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	async findWaiting(userId: number): Promise<User[]> {
		return await Promise.all(
			(
				await this.findWaitingIds(userId)
			).map(async (friendId) => {
				return await this.userService.findOne(friendId);
			})
		);
	}

	async findWaitingNames(userId: number): Promise<string[]> {
		return (await this.findWaiting(userId)).map((friend) => friend.username);
	}

	/**
	 * A friend is when both people have accepted the friend request
	 */
	async findFriendsIds(userId: number): Promise<number[]> {
		const sqlStatement: SelectQueryBuilder<Friendship> = this.friendsRepository.createQueryBuilder('friendship');

		// await this.userService.findOne(userId);
		sqlStatement.where('friendship.status = :status', { status: FriendshipStatus.ACCEPTED });
		sqlStatement.andWhere(new Brackets(web => {
			web.where('friendship.user1_id = :id', { id: userId }),
			web.orWhere('friendship.user2_id = :id')
		}))

		return await sqlStatement.getMany().then((friendships: Friendship[]) => {
			const friends: number[] = new Array();

			friendships.forEach((fs) => {
				if (fs.user1_id != userId) friends.push(fs.user1_id);
				else friends.push(fs.user2_id);
			});
			return friends;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	async findFriends(userId: number): Promise<User[]> {
		return await Promise.all(
			(
				await this.findFriendsIds(userId)
			).map(async (friendId) => {
				return await this.userService.findOne(friendId);
			})
		);
	}

	async findFriendsNames(userId: number): Promise<string[]> {
		return (await this.findFriends(userId)).map((friend) => friend.username);
	}

	async findAllRelations(userId: number): Promise<Friendship[]> {
		const sqlStatement: SelectQueryBuilder<Friendship> = this.friendsRepository.createQueryBuilder('friendship');

		sqlStatement.where('friendship.user1_id = :id', { id: userId }).orWhere('friendship.user2_id = :id');

		return await sqlStatement.getMany().then((friendships: Friendship[]) => {
			return friendships;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	async findAllRelationsId(userId: number): Promise<number[]> {
		return await this.findAllRelations(userId).then((friendships: Friendship[]) => {
			return friendships.map(f => f.user1_id != userId ? f.user1_id : f.user2_id);
		});
	}

	async findAll(): Promise<Friendship[]> {
		try {
			return await this.friendsRepository.find();
		} catch (err) {
			return this.userService.lambdaDatabaseUnvailable(err);
		}
	}


}
