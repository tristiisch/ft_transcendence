import { IsInt } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Channel {

	@PrimaryGeneratedColumn()
	@IsInt()
	id: number;

	@Column({ unique: true, length: 32 })
	name: string;
}
