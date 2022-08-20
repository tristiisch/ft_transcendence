/** @prettier */
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { UserStatus } from './user.entity';

// DTO = Data transfer object
export class UserDTO {
	@IsString()
	@IsOptional()
	@IsNotEmpty()
	username?: string;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	avatar?: string;

	status?: UserStatus;
}
