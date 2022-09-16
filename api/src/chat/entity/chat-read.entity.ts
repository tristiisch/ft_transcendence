import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";

@Unique(["id_user", "id_chat"])
@Entity()
export class ChatRead {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: false })
	id_user: number;

	@Column({ nullable: false })
	id_chat: number;

	@Column()
	id_message: number;

	@Column({ type: 'timestamptz', precision: null, default: () => 'CURRENT_TIMESTAMP' , onUpdate: 'CURRENT_TIMESTAMP' })
	last_update?: Date;

}
