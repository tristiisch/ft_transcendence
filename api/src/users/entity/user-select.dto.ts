/** @prettier */
import { NotAcceptableException } from '@nestjs/common';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { UsersService } from 'users/users.service';
import { User } from './user.entity';

export class UserSelectDTO {
	@IsInt()
	@IsOptional()
	@IsPositive()
	id: number;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	username: string;

	/**
	 * @throws {NotAcceptableException} UserSelectDTO must have a id or username
	 */
	public async resolveUser?(usersService: UsersService): Promise<User> {
		if (this.id != null) {
			// console.log("UserSelectDTO resolve with Id " + this.id);
			return await usersService.findOne(this.id);
		} else if (this.username != null) {
			// console.log("UserSelectDTO resolve with Username " + this.username);
			return await usersService.findOneByUsername(this.username);
		}
		throw new NotAcceptableException("Unable to find a user without key 'id' or 'username'.");
	}

	public isEmpty?() {
		return this.id == null && this.username == null;
	}

	// async resolveUserAvatar64(usersService: UsersService) : Promise<User> {
	// 	if (this.id != null) {
	// 		// console.log("UserSelectDTO resolve with Id " + this.id);
	// 		return await usersService.findOneAvatar(this.id);
	// 	} else if (this.username != null) {
	// 		// console.log("UserSelectDTO resolve with Username " + this.username);
	// 		return await usersService.findOneAvatarByUsername(this.username);
	// 	}
	// 	throw new NotAcceptableException("Unable to find a user without key 'id' or 'username'.");
	// }
}
