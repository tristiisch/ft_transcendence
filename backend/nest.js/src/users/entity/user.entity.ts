import { IsEmail, IsInt, IsNotEmpty } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum UserStatus {
	OFFLINE,
	ONLINE,
	IN_GAME,
	IN_CHAT,
	SPEC
}

@Entity()
export class User {

	@PrimaryGeneratedColumn()
	@IsInt()
	id: number;

	@Column({ unique: true, length: 32 })
	username: string;

	@Column({ unique: true, length: 64 })
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@Column({ unique: true, nullable: true })
	token42?: string;

	@Column("int", { nullable: true, array: true })
	friends?: number[];

	@Column({ default: 0 })
	@IsInt()
	wins: number;

	@Column({ default: 0 })
	@IsInt()
	losses: number;

	@Column({ unique: true, nullable: true })
	@IsInt()
	ladder_score: number;

	@Column({ type: "enum", enum: UserStatus, default: UserStatus.OFFLINE})
	status: UserStatus;
}
