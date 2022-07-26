import { IsEmail, IsInt } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

	@PrimaryGeneratedColumn()
	@IsInt()
	id: number;

	@Column({ unique: true, length: 32 })
	username: string;

	@Column({ unique: true, length: 64 })
	@IsEmail()
	email: string;

	@Column({ unique: true, nullable: true })
	token42?: string;
}
