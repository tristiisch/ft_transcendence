import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true, length: 32 })
	username: string;

	@Column({ unique: true, length: 64 })
	email: string;

	@Column({ unique: true, nullable: true })
	token42?: string;
}
