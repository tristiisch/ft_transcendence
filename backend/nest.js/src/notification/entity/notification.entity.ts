/** @prettier */
import { IsInt } from 'class-validator';
import { User } from 'src/users/entity/user.entity';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum NotificationType {
	UNKNOWN,
	FRIEND_REQUEST,
	MATCH_REQUEST,
}

@Entity()
export class Notification extends BaseEntity {
	@PrimaryGeneratedColumn()
	@IsInt()
	id: number;

	@Column()
	@IsInt()
	user_id: number;

	@Column({ nullable: true })
	from_user_id: number;

	@Column()
	is_deleted: boolean;

	@Column({ nullable: true, type: 'text', array: true })
	arguments?: string[];

	@Column({ type: 'enum', enum: NotificationType, default: NotificationType.UNKNOWN })
	type: NotificationType;

	@Column({ type: 'timestamptz', precision: null, nullable: true, default: () => 'CURRENT_TIMESTAMP' })
	date?: Date;

}
