import { forwardRef, Inject, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { DeleteResult, InsertResult, Repository, SelectQueryBuilder } from 'typeorm';
import { Friendship, FriendshipStatus } from './entity/friendship.entity';

@Injectable()
export class FriendsService {

	constructor(
		@InjectRepository(Friendship)
		private friendsRepository: Repository<Friendship>,
	) {}

    @Inject(UsersService)
    private readonly userService: UsersService;

	/**
	 * Add a friend request. @param user1 is the userId of the user who ask for friendship @param user2
	 */
	async addFriendRequest(userId: number, targetId: number): Promise<Friendship> {
		if (userId == targetId)
			throw new PreconditionFailedException("A user cannot ask for friendships himself.");

		await this.userService.findOne(userId);
		await this.userService.findOne(targetId);
		const friendshipCheck: Friendship = await this.findOne(userId, targetId, false);

		if (friendshipCheck) {
			throw new NotAcceptableException("They is already a relation between " + friendshipCheck.user_id1 + " and " + friendshipCheck.user_id2
				+ " with status " + FriendshipStatus[friendshipCheck.status] + ".");
		}
		const friendship: Friendship = new Friendship();

		friendship.user_id1 = userId;
		friendship.user_id2 = targetId;
	
		return await this.friendsRepository.insert(friendship).then((insertResult: InsertResult) => {
			if (insertResult.identifiers.length < 1) {
				throw new InternalServerErrorException("Can't add friendship of " + friendship.user_id1 + " and " + friendship.user_id1 + ".");
			} else if (insertResult.identifiers.length > 1) {
				throw new InternalServerErrorException(insertResult.identifiers.length + " rows was modify instead of one.");
			}
			return friendship;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	/**
	 * Add a friend request. @param user1 is the userId of the user who ask for friendship @param user2
	 */
	 async acceptFriendRequest(userId1: number, userId2: number): Promise<Friendship> {
		if (userId1 == userId2)
			throw new PreconditionFailedException("A user cannot ask for friendships himself.");

		await this.userService.findOne(userId1);
		await this.userService.findOne(userId2);
		const friendship: Friendship = await this.findOne(userId1, userId2, true);

		if (!friendship) {
			throw new NotAcceptableException(userId2 + " has no friend request from " + userId1 + ".");
		}

		if (friendship.status == FriendshipStatus.ACCEPTED) {
			throw new NotAcceptableException(userId2 + " is already friend with " + userId1 + ".");
		}

		friendship.status = FriendshipStatus.ACCEPTED;
	
		return await this.friendsRepository.save(friendship).then((fs: Friendship) => {
			return fs;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	/**
	 * Remove a relation (friend request or friend relation). Order of params changed nothing
	 */
	async removeFriendship(userId: number, targetId: number) {
		if (userId == targetId)
			throw new PreconditionFailedException("A user cannot be friend with itself.");

		await this.userService.findOne(userId);
		await this.userService.findOne(targetId);
		const friendship: Friendship = await this.findOne(userId, targetId, false);

		if (!friendship) {
			throw new NotAcceptableException("They is no friend request/relation between " + userId + " and " + targetId + ".");
		}

		return await this.friendsRepository.delete(friendship).then((value: DeleteResult) => {
			if (!value.affected || value.affected == 0)
				throw new InternalServerErrorException("Can't remove friendship of " + friendship.user_id1 + " and " + friendship.user_id1 + ".");
			else
				return { statusCode: 200, message: "Friendship between " + userId + " and " + targetId + " has been successfully removed." };
		}, this.userService.lambdaDatabaseUnvailable);
	}

	/**
	 * @param strict boolean value if the order of the parameters @param user1 & @param user2 is important 
	 */
	private async findOne(user1: number, user2: number, strict: boolean): Promise<Friendship> {
		const sqlStatement: SelectQueryBuilder<Friendship> = this.friendsRepository.createQueryBuilder("friendship");

		sqlStatement.where("friendship.user_id1 = :id1", { id1: user1 }).andWhere("friendship.user_id2 = :id2", { id2: user2 });
		if (!strict) {
			sqlStatement.orWhere("friendship.user_id1 = :id2").andWhere("friendship.user_id2 = :id1");
		}
		// console.log("SQL friendship", sqlStatement.getQueryAndParameters());
	
		return await sqlStatement.getOne().then((friendship: Friendship) => {
			return friendship;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	async findAllRelations(userId: number): Promise<Friendship[]> {
		const sqlStatement: SelectQueryBuilder<Friendship> = this.friendsRepository.createQueryBuilder("friendship");

		await this.userService.findOne(userId);
		sqlStatement.where("friendship.user_id1 = :id", { id: userId }).orWhere("friendship.user_id2 = :id");
	
		return await sqlStatement.getMany().then((friendships: Friendship[]) => {
			return friendships;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	/**
	 * A pending invitation is when you make a friend request and you are waiting for its validation
	 */
	async findPendingIds(userId: number): Promise<number[]> {
		const sqlStatement: SelectQueryBuilder<Friendship> = this.friendsRepository.createQueryBuilder("friendship");

		await this.userService.findOne(userId);
		sqlStatement.where("friendship.user_id1 = :id", { id: userId }).andWhere("friendship.status = :status", { status: FriendshipStatus.PENDING });
	
		return await sqlStatement.getMany().then((friendships: Friendship[]) => {
			const friends: number[] = new Array();
			
			friendships.forEach(fs => {
				if (fs.user_id1 != userId)
					friends.push(fs.user_id1);
				else
					friends.push(fs.user_id2);
			});
			return friends;
		}, this.userService.lambdaDatabaseUnvailable);
	}
		
	async findPending(userId: number): Promise<User[]>  {
		return await Promise.all((await this.findPendingIds(userId)).map(async (friendId) => {
			return (await this.userService.findOne(friendId))
		}));
	}

	async findPendingNames(userId: number): Promise<string[]> {
		return (await this.findPending(userId)).map(friend => friend.username);
	}

	/**
	 * A waiting invitation is when someone has asked you as a friend and is waiting for your answer
	 */
	async findWaitingIds(userId: number): Promise<number[]> {
		const sqlStatement: SelectQueryBuilder<Friendship> = this.friendsRepository.createQueryBuilder("friendship");

		await this.userService.findOne(userId);
		sqlStatement.where("friendship.user_id2 = :id", { id: userId }).andWhere("friendship.status = :status", { status: FriendshipStatus.PENDING });
	
		return await sqlStatement.getMany().then((friendships: Friendship[]) => {
			const friends: number[] = new Array();
			
			friendships.forEach(fs => {
				if (fs.user_id1 != userId)
					friends.push(fs.user_id1);
				else
					friends.push(fs.user_id2);
			});
			return friends;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	async findWaiting(userId: number): Promise<User[]>  {
		return await Promise.all((await this.findWaitingIds(userId)).map(async (friendId) => {
			return (await this.userService.findOne(friendId))
		}));
	}

	async findWaitingNames(userId: number): Promise<string[]> {
		return (await this.findWaiting(userId)).map(friend => friend.username);
	}

	/**
	 * A friend is when both people have accepted the friend request
	 */
	async findFriendsIds(userId: number): Promise<number[]> {
		const sqlStatement: SelectQueryBuilder<Friendship> = this.friendsRepository.createQueryBuilder("friendship");

		await this.userService.findOne(userId);
		sqlStatement.where("friendship.status = :status", { status: FriendshipStatus.ACCEPTED });
		sqlStatement.where("friendship.user_id1 = :id", { id: userId }).orWhere("friendship.user_id2 = :id");
	
		return await sqlStatement.getMany().then((friendships: Friendship[]) => {
			const friends: number[] = new Array();
			
			friendships.forEach(fs => {
				if (fs.user_id1 != userId)
					friends.push(fs.user_id1);
				else
					friends.push(fs.user_id2);
			});
			return friends;
		}, this.userService.lambdaDatabaseUnvailable);
	}

	async findFriends(userId: number): Promise<User[]>  {
		return await Promise.all((await this.findFriendsIds(userId)).map(async (friendId) => {
			return (await this.userService.findOne(friendId))
		}));
	}

	async findFriendsNames(userId: number): Promise<string[]> {
		return (await this.findFriends(userId)).map(friend => friend.username);
	}
}
