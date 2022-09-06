/** @prettier */
import { IsInt } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, TableInheritance } from 'typeorm';
import { User } from 'users/entity/user.entity';
import { MessageFront } from './message.entity';

export enum ChatStatus {
	PUBLIC,
	PRIVATE,
	PROTECTED
}

@Entity()
@TableInheritance({ column: { type: 'enum', enum: ChatStatus, name: 'type' } })
export class Chat {

	@PrimaryGeneratedColumn()
	id?: number;

	@Column({ type: 'enum', enum: ChatStatus, default: ChatStatus.PUBLIC, name: 'type' })
	type: ChatStatus;

	@Column("int", { nullable: true, array: true })
	users_ids: number[];
	// @ManyToMany(() => User)
	// @JoinTable()
	// users_ids: User[];
}

export class ChatFront {

	id: number;
	type: ChatStatus;
	messages: MessageFront[];
}
