/** @prettier */
import { IsInt } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Channel extends BaseEntity {
	@PrimaryGeneratedColumn()
	@IsInt()
	id: number;

	@Column({ unique: true, length: 32 })
	name: string;
}
