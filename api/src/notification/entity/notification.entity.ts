/** @prettier */
import { NotFoundException } from '@nestjs/common';
import { IsInt } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'users/entity/user.entity';
import { UsersService } from 'users/users.service';

export enum NotificationType {
	UNKNOWN,
	FRIEND_REQUEST,
	MATCH_REQUEST,
	MATCH_ACCEPT,
	MATCH_DECLINE,
	FRIEND_ACCEPT,
	FRIEND_DECLINE,
	FRIEND_REMOVE
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

	@Column({ type: 'enum', enum: NotificationType, default: NotificationType.UNKNOWN })
	type: NotificationType;

	@Column({ type: 'timestamptz', precision: null, nullable: true, default: () => 'CURRENT_TIMESTAMP' })
	date?: Date;

	async toFront?(userService: UsersService, userCached: User[]): Promise<NotificationFront> {
		if (!userCached)
			userCached = new Array();
		const notifFront: NotificationFront = new NotificationFront();
		notifFront.from_user = await userService.findOneWithCache(this.from_user_id, userCached);

		notifFront.id = this.id;
		notifFront.from_user_id = this.from_user_id;
		if (this.type == NotificationType.FRIEND_REQUEST) {
			notifFront.message = `Friend request from ${notifFront.from_user.username}.`;
		} else if (this.type == NotificationType.MATCH_REQUEST) {
			notifFront.message = `Game request from ${notifFront.from_user.username}.`;
		} else if (this.type == NotificationType.MATCH_ACCEPT) {
			notifFront.message = `${notifFront.from_user.username} accepted your game invitation, you will be redirected soon...`;
		} else if (this.type == NotificationType.MATCH_DECLINE) {
			notifFront.message = `${notifFront.from_user.username} decline your game invitation.`;
		} else if (this.type == NotificationType.FRIEND_ACCEPT) {
			notifFront.message = `${notifFront.from_user.username} is now friend with you.`;
		} else if (this.type == NotificationType.FRIEND_DECLINE) {
			notifFront.message = `${notifFront.from_user.username} decline your friend request.`;
		} else if (this.type == NotificationType.FRIEND_REMOVE) {
			notifFront.message = `${notifFront.from_user.username} is no longer friend with you.`;
		} else {
			throw new NotFoundException(`Unknown notif type ${this.type}.`);
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
	match_uuid: string;
	message: string;
	date: string;
	type: NotificationType;
}
