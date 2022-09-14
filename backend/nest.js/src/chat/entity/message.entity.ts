import { IsInt } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

	public toFront(): MessageFront {
		const msgFront: MessageFront = {
			idMessage: this.id,
			idChat: this.id_channel,
			idSender: this.id_sender,
			message: this.message,
			send: true,
			read: false,
			date: `${this.date.toLocaleString()}`,
		};
		return msgFront;
	}
}

export class MessageFront {
	idMessage?: number;
	idChat?: number;
	idSender: number;
	message: string;
	send?: boolean;
	read: boolean;
	date: string;
}
