import { forwardRef, Inject, Injectable, NotAcceptableException, PreconditionFailedException } from '@nestjs/common';
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
			throw new PreconditionFailedException("A user can't be friend with itself.");

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

		let isAffected: boolean = await this.userService.usersRepository.update({id: user.id} , { friends: userFriends }).then(res => res.affected == 1, this.userService.lambdaDatabaseUnvailable);
		if (isAffected) {
			isAffected = await this.userService.usersRepository.update({id: target.id}, { friends: targetFriends }).then(res => res.affected == 1, reason => false);
			if (isAffected)
				return { statusCode: 200, message: user.username + " and " + target.username + " are now friends." };
			else {
				userFriends.splice(userFriends.indexOf(target.id), 1);
				isAffected = await this.userService.usersRepository.update({id: user.id} , { friends: userFriends }).then(res => res.affected == 1, this.userService.lambdaDatabaseUnvailable);
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
			throw new PreconditionFailedException("A user can't be friend with itself.");

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

		let isAffected: boolean = await this.userService.usersRepository.update({id: user.id} , { friends: userFriends }).then(res => res.affected == 1, this.userService.lambdaDatabaseUnvailable);
		if (isAffected) {
			isAffected = await this.userService.usersRepository.update({id: target.id}, { friends: targetFriends }).then(res => res.affected == 1, reason => false);
			if (isAffected)
				return { statusCode: 200, message: user.username + " and " + target.username + " are no more friends." };
			else {
				userFriends.splice(userFriends.indexOf(target.id), 1);
				isAffected = await this.userService.usersRepository.update({id: user.id} , { friends: userFriends }).then(res => res.affected == 1, this.userService.lambdaDatabaseUnvailable);
				if (!isAffected) {
					throw new NotAcceptableException(user.username + " is no more friend with " + target.username + " but " + target.username + " is friend with " + target.username);
				}
			}
		} else {
			throw new NotAcceptableException("Can't remove " + user.username + " and " + target.username + " friendship.");
		}
	}
}
