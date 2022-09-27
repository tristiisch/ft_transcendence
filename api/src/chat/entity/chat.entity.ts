/** @prettier */
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, TableInheritance } from 'typeorm';
import { MessageFront } from './message.entity';

export enum ChatStatus {
	PUBLIC,
	PRIVATE,
	PROTECTED,
	DISCUSSION
}

@Entity()
@TableInheritance({ column: { type: 'enum', enum: ChatStatus, name: 'type' } })
export class Chat {

	@PrimaryGeneratedColumn()
	id?: number;

	@Column({ type: 'enum', enum: ChatStatus, default: ChatStatus.PUBLIC, name: 'type' })
	type: ChatStatus;

	@Column("int", { nullable: true, array: true })
	users_ids: number[] | null;
	// @ManyToMany(() => User)
	// @JoinTable()
	// users_ids: User[];

	//public async toFront?(chatService: ChatService, user: User | null, usersCached: User[] | null): Promise<ChannelFront | DiscussionFront> { return null }
}

export class ChatFront {

	id: number;
	type: ChatStatus;
	messages: MessageFront[];
}
