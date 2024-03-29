import { Logger } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { User } from "users/entity/user.entity";
import { ChatRead } from "./chat-read.entity";

export enum MessageType {
	MSG,
	GAME_INVIT,
	AUTO
}

@Entity()
export class Message {

	@PrimaryGeneratedColumn()
	id?: number;

	@Column()
	id_sender: number;

	@Column()
	id_channel: number;

	@Column({ type: 'timestamptz', precision: null, default: () => 'CURRENT_TIMESTAMP' })
	date?: Date;

	@Column()
	message: string;

	@Column({ type: 'enum', enum: MessageType, default: MessageType.MSG, name: 'type' })
	type: MessageType;

	@Column({ nullable: true, default: null })
	canUseButton: boolean;

	public toFront(user: User | null, chatRead: ChatRead | null): MessageFront {
		if (chatRead != null && chatRead.id_chat !== this.id_channel)
			throw new WsException('Not same id in Message#toFront');
		const msgFront: MessageFront = {
			idMessage: this.id,
			idChat: this.id_channel,
			idSender: this.id_sender,
			message: this.message,
			send: true,
			read: chatRead ? this.id <= chatRead.id_message : false,
			date: this.date.toLocaleString(),
			type: this.type,
			canUseButton: this.canUseButton
		};
		if (this.type === MessageType.MSG || this.type === MessageType.GAME_INVIT) {
			if (!user) {
				Logger.error(`user is null for message#toFront : ${JSON.stringify(this)}`, 'Chat');
			} else {
				msgFront.avatarSender = user.avatar;
				msgFront.usernameSender = user.username;
			}
		}
		return msgFront;
	}
}

export class MessageFront {
	idMessage?: number;
	idChat?: number;
	idSender: number;
	avatarSender?: string;
	usernameSender?: string;
	message: string;
	send?: boolean;
	read: boolean;
	date: string;
	type: MessageType;
	canUseButton: boolean;
}
