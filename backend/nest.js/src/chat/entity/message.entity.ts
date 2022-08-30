import { IsInt } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

export class MessageFront {
	idMessage?: number;
	idChat?: number;
	date: string;
	message: string;
	idSender: number;
}
