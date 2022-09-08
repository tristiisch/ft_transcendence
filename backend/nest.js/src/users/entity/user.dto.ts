/** @prettier */
import { IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';
import { UserStatus } from './user.entity';

export class UserDTO {

	@IsString()
	@IsOptional()
	@MinLength(3)
	@MaxLength(16)
	username?: string;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	avatar?: string;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	avatar_64?: string;

	status?: UserStatus;
}
