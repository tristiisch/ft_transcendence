/** @prettier */
import { IsInt } from 'class-validator';
import { User } from 'src/users/entity/user.entity';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ChatStatus {
	PUBLIC,
	PRIVATE,
	PROTECTED,
	DISCUSSION
}

@Entity()
export class Channel {

	@PrimaryGeneratedColumn()
	@IsInt()
	id: number;

	@Column({ unique: true })
	name: string;

	@Column({ type: 'enum', enum: ChatStatus, default: ChatStatus.PUBLIC })
	type: ChatStatus;

	@Column()
	owner_id: number;

	@Column()
	avatar: string;

	@Column()
	password: string | null;

	@Column("int", { nullable: true, array: true })
	users_ids: number[];

	@Column("int", { nullable: true, array: true })
	admin_ids: number[];

	@Column("int", { nullable: true, array: true })
	mute_ids: number[];

	@Column("int", { nullable: true, array: true })
	banned_ids: number[];

	messages: Message;
}

@Entity()
export class Message {

	@PrimaryGeneratedColumn()
	@IsInt()
	id: number;

	@Column()
	id_sender: number;

	@Column()
	id_channel: number;

	@Column({ type: 'timestamptz', precision: null, default: () => 'CURRENT_TIMESTAMP' })
	date: Date;

	@Column()
	message: string;
}
