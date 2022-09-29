/** @prettier */
import { IsAlphanumeric, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';
import { UserStatus } from './user.entity';

export class UserDTO {

	@IsString()
	@IsOptional()
	@MinLength(3)
	@MaxLength(10)
    @IsAlphanumeric()
	username?: string;

	@IsString()
	@IsOptional()
	avatar_64?: string;

	status?: UserStatus;
}
