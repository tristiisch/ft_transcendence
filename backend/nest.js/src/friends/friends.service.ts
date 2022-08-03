import { forwardRef, Inject, Injectable, NotAcceptableException, NotFoundException, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class FriendsService {

    @Inject(UsersService)
    private readonly userService: UsersService;

	async getFriendsIds(userId: number): Promise<number[]> {
		let user: User = await this.userService.findOne(userId);
		if (!user.friends || user.friends.length == 0)
			throw new NotFoundException("He has no friends.");
		return user.friends;
	}

	async getFriends(userId: number): Promise<User[]>  {
		return await Promise.all((await this.getFriendsIds(userId)).map(async (friendId) => {
			return (await this.userService.findOne(friendId))
		}));
	}

	async getFriendsNames(userId: number): Promise<string[]> {
		return (await this.getFriends(userId)).map(friend => friend.username);
	}

	async addFriend(userId: number, targetId: number) {
		if (userId == targetId)
			throw new PreconditionFailedException("A user cannot be friend with itself.");

		let user: User = await this.userService.findOne(userId);
		let target: User = await this.userService.findOne(targetId);

		let userFriends: number[], targetFriends: number[];
		if (user.friends != null) {
			userFriends = user.friends;
			if (userFriends.includes(target.id)) {
				throw new NotAcceptableException(user.username + " is already friend with " + target.username + ".");
			}
		} else
			userFriends = new Array<number>();

		if (target.friends != null) {
			targetFriends = target.friends;
			if (targetFriends.includes(user.id)) {
				throw new NotAcceptableException(target.username + " is already friend with " + user.username + ".");
			}
		}
		else
			targetFriends = new Array<number>();

		userFriends.push(target.id);
		targetFriends.push(user.id);

		let isAffected: boolean = await this.userService.getRepo().update({id: user.id} , { friends: userFriends }).then(res => res.affected == 1, this.userService.lambdaDatabaseUnvailable);
		if (isAffected) {
			isAffected = await this.userService.getRepo().update({id: target.id}, { friends: targetFriends }).then(res => res.affected == 1, reason => false);
			if (isAffected)
				return { statusCode: 200, message: user.username + " and " + target.username + " are now friends." };
			else {
				userFriends.splice(userFriends.indexOf(target.id), 1);
				isAffected = await this.userService.getRepo().update({id: user.id} , { friends: userFriends }).then(res => res.affected == 1, this.userService.lambdaDatabaseUnvailable);
				if (!isAffected) {
					throw new NotAcceptableException(user.username + " is now friend with " + target.username + " but " + target.username + " is not friend with " + target.username);
				}
			}
		} else {
			throw new NotAcceptableException("Can't make " + user.username + " and " + target.username + " friends.");
		}
	}

	async removeFriend(userId: number, targetId: number) {
		if (userId == targetId)
			throw new PreconditionFailedException("A user cannot be friend with itself.");

		let user: User = await this.userService.findOne(userId);
		let target: User = await this.userService.findOne(targetId);

		let userFriends: number[], targetFriends: number[];
		if (user.friends != null) {
			userFriends = user.friends;
			if (!userFriends.includes(target.id)) {
				throw new NotAcceptableException(user.username + " is not friend with " + target.username);
			}
		} else
			userFriends = new Array<number>();

		if (target.friends != null) {
			targetFriends = target.friends;
			if (!targetFriends.includes(user.id)) {
				throw new NotAcceptableException(target.username + " is not friend with " + user.username);
			}
		}
		else
			targetFriends = new Array<number>();

		userFriends.splice(userFriends.indexOf(target.id))
		targetFriends.splice(targetFriends.indexOf(user.id))

		let isAffected: boolean = await this.userService.getRepo().update({id: user.id} , { friends: userFriends }).then(res => res.affected == 1, this.userService.lambdaDatabaseUnvailable);
		if (isAffected) {
			isAffected = await this.userService.getRepo().update({id: target.id}, { friends: targetFriends }).then(res => res.affected == 1, reason => false);
			if (isAffected)
				return { statusCode: 200, message: user.username + " and " + target.username + " are no more friends." };
			else {
				userFriends.splice(userFriends.indexOf(target.id), 1);
				isAffected = await this.userService.getRepo().update({id: user.id} , { friends: userFriends }).then(res => res.affected == 1, this.userService.lambdaDatabaseUnvailable);
				if (!isAffected) {
					throw new NotAcceptableException(user.username + " is no more friend with " + target.username + " but " + target.username + " is friend with " + target.username);
				}
			}
		} else {
			throw new NotAcceptableException("Can't remove " + user.username + " and " + target.username + " friendship.");
		}
	}

	async getFriendsPendingIds(userId: number): Promise<number[]> {
		let user: User = await this.userService.findOne(userId);
		if (!user.pending_friends_requests || user.pending_friends_requests.length == 0)
			throw new NotFoundException("He has no pending friend requests.");
		return user.pending_friends_requests;
	}

	async getFriendsPending(userId: number): Promise<User[]>  {
		return await Promise.all((await this.getFriendsPendingIds(userId)).map(async (friendId) => {
			return (await this.userService.findOne(friendId))
		}));
	}

	async getFriendsPendingNames(userId: number): Promise<string[]> {
		return (await this.getFriendsPending(userId)).map(friend => friend.username);
	}

	async getFriendsReceivedIds(userId: number): Promise<number[]> {
		let user: User = await this.userService.findOne(userId);
		if (!user.received_friends_requests || user.received_friends_requests.length == 0)
			throw new NotFoundException("He has no friend request received.");
		return user.received_friends_requests;
	}

	async getFriendsReceived(userId: number): Promise<User[]>  {
		return await Promise.all((await this.getFriendsReceivedIds(userId)).map(async (friendId) => {
			return (await this.userService.findOne(friendId))
		}));
	}

	async getFriendsReceivedNames(userId: number): Promise<string[]> {
		return (await this.getFriendsReceived(userId)).map(friend => friend.username);
	}

	async addFriendRequest(userId: number, targetId: number) {
		if (userId == targetId)
			throw new PreconditionFailedException("A user cannot ask for friendships himself.");

		let user: User = await this.userService.findOne(userId);
		let target: User = await this.userService.findOne(targetId);

		let userPending: number[], targetReceived: number[];
		if (user.pending_friends_requests != null) {
			userPending = user.pending_friends_requests;
			if (userPending.includes(target.id)) {
				throw new NotAcceptableException(user.username + " has already asked " + target.username + " as a friend.");
			}
		} else
			userPending = new Array<number>();

		if (target.received_friends_requests != null) {
			targetReceived = target.received_friends_requests;
			if (targetReceived.includes(user.id)) {
				throw new NotAcceptableException(target.username + " has already received " + user.username + "'s invitation.");
			}
		}
		else
			targetReceived = new Array<number>();

		userPending.push(target.id);
		targetReceived.push(user.id);

		let isAffected: boolean = await this.userService.getRepo().update({id: user.id} , { pending_friends_requests: userPending }).then(res => res.affected == 1, this.userService.lambdaDatabaseUnvailable);
		if (isAffected) {
			isAffected = await this.userService.getRepo().update({id: target.id}, { received_friends_requests: targetReceived }).then(res => res.affected == 1, reason => false);
			if (isAffected)
				return { statusCode: 200, message: user.username + " asked in friend " + target.username + "." };
			else {
				userPending.splice(userPending.indexOf(target.id), 1);
				isAffected = await this.userService.getRepo().update({id: user.id} , { pending_friends_requests: userPending }).then(res => res.affected == 1, this.userService.lambdaDatabaseUnvailable);
				if (!isAffected) {
					throw new NotAcceptableException(user.username + " asked in friend " + target.username + " but " + target.username + " didn't receive the invitation of " + target.username);
				}
			}
		} else {
			throw new NotAcceptableException("Can't make " + user.username + " and " + target.username + " friends.");
		}
	}

	async removeFriendRequest(userId: number, targetId: number) {
		if (userId == targetId)
			throw new PreconditionFailedException("A user cannot be friend with itself.");

		let user: User = await this.userService.findOne(userId);
		let target: User = await this.userService.findOne(targetId);

		let userPending: number[], targetReceived: number[];
		if (user.pending_friends_requests != null) {
			userPending = user.pending_friends_requests;
			if (!userPending.includes(target.id)) {
				throw new NotAcceptableException(user.username + " didn't invite " + target.username);
			}
		} else
			userPending = new Array<number>();

		if (target.received_friends_requests != null) {
			targetReceived = target.received_friends_requests;
			if (!targetReceived.includes(user.id)) {
				throw new NotAcceptableException(target.username + " didn't receive an invitation from " + user.username);
			}
		}
		else
			targetReceived = new Array<number>();

		userPending.splice(userPending.indexOf(target.id))
		targetReceived.splice(targetReceived.indexOf(user.id))

		let isAffected: boolean = await this.userService.getRepo().update({id: user.id} , { pending_friends_requests: userPending }).then(res => res.affected == 1, this.userService.lambdaDatabaseUnvailable);
		if (isAffected) {
			isAffected = await this.userService.getRepo().update({id: target.id}, { received_friends_requests: targetReceived }).then(res => res.affected == 1, reason => false);
			if (isAffected)
				return { statusCode: 200, message: user.username + " deleted the invitation for " + target.username + "." };
			else {
				userPending.splice(userPending.indexOf(target.id), 1);
				isAffected = await this.userService.getRepo().update({id: user.id} , { pending_friends_requests: userPending }).then(res => res.affected == 1, this.userService.lambdaDatabaseUnvailable);
				if (!isAffected) {
					throw new NotAcceptableException(user.username + " deleted the invitation for " + target.username + " but " + target.username + " still has the invitation from " + target.username);
				}
			}
		} else {
			throw new NotAcceptableException("Can't delete " + user.username + "'s invitation " + target.username + ".");
		}
	}
}
