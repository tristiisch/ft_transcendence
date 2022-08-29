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

export default interface Chat {
	id: number;

	// @Column({ type: 'enum', enum: ChatStatus, default: ChatStatus.PUBLIC })
	type: ChatStatus;
}

@Entity()
export class Channel implements Chat {
	@PrimaryGeneratedColumn()
	@IsInt()
	id: number;

	@Column({ unique: true })
	name: string;

	@Column()
	type: ChatStatus;

	@Column()
	owner_id: User;

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

	// messages_id: number[];
}


export interface Discussion extends Chat {
	user: User,
}

@Entity()
export class Message {

	@PrimaryGeneratedColumn()
	@IsInt()
	id: number;

	@Column()
	id_chat: number;

	@Column({ type: 'timestamptz', precision: null, default: () => 'CURRENT_TIMESTAMP' })
	date: string;

	@Column()
	message: string;

	@Column()
	id_sender: number;
}
