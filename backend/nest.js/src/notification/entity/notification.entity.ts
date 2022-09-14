/** @prettier */
import { IsInt } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'users/entity/user.entity';
import { UsersService } from 'users/users.service';

export enum NotificationType {
	UNKNOWN,
	FRIEND_REQUEST,
	MATCH_REQUEST,
	FRIEND_ACCEPT,
	FRIEND_DECLINE,
}

@Entity()
export class Notification {
	@PrimaryGeneratedColumn()
	@IsInt()
	id?: number;

	@Column()
	@IsInt()
	user_id: number;

	@Column({ nullable: true })
	from_user_id: number;

	@Column({ default: false })
	is_deleted?: boolean;

	@Column({ nullable: true, type: 'text', array: true })
	arguments?: string[];

	@Column({ type: 'enum', enum: NotificationType, default: NotificationType.UNKNOWN })
	type: NotificationType;

	@Column({
		type: 'timestamptz',
		precision: null,
		nullable: true,
		default: () => 'CURRENT_TIMESTAMP',
	})
	date?: Date;

	async toFront?(userService: UsersService, userCached: User[]): Promise<NotificationFront> {
		if (!userCached) userCached = new Array();
		const notifFront: NotificationFront = new NotificationFront();
		notifFront.from_user = await userService.findOneWithCache(this.from_user_id, userCached);

		notifFront.id = this.id;
		notifFront.from_user_id = this.from_user_id;
		if (this.type == NotificationType.FRIEND_REQUEST) {
			notifFront.message = `Friend request from ${notifFront.from_user.username}.`;
		} else if (this.type == NotificationType.MATCH_REQUEST) {
			notifFront.message = `Game request from ${notifFront.from_user.username}.`;
		} else if (this.type == NotificationType.FRIEND_ACCEPT) {
			notifFront.message = `${notifFront.from_user.username} is now friend with you.`;
		} else if (this.type == NotificationType.FRIEND_DECLINE) {
			notifFront.message = `${notifFront.from_user.username} is no longer friend with you.`;
		}
		notifFront.date = this.date.toDateString();
		notifFront.type = this.type;
		return notifFront;
	}
}

export class NotificationFront {
	id: number;
	from_user_id: number;
	from_user: User;
	message: string;
	date: string;
	type: NotificationType;
}
