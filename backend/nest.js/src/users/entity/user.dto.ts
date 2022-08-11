import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";
import { UserStatus } from "./user.entity";

// DTO = Data transfer object
export class UserDTO {

	@IsInt()
	@IsOptional()
	@IsPositive()
	readonly id: number;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	username?: string;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	displayname?: string;

	@IsEmail()
	@IsNotEmpty()
	@IsOptional()
	email?: string;

	// ? is for optional field 
	token42?: string; 
	friends?: number[];

	@IsInt()
	@IsOptional()
	@IsPositive()
	wins?: number;

	@IsInt()
	@IsOptional()
	@IsPositive()
	losses?: number;

	@IsInt()
	@IsPositive()
	@IsOptional()
	ladder_score?: number;

	status?: UserStatus;
}
