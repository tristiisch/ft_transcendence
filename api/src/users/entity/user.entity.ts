/** @prettier */
import { IsNotEmpty, IsNumber } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UserStatus {
	OFFLINE,
	ONLINE,
	IN_GAME,
	SPEC,
}

@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	login_42: string;

	@Column({ unique: true, nullable: true })
	@IsNotEmpty()
	username: string;

	avatar: string;

	@Column({ nullable: true })
	avatar_64: string;

	@Column({ type: "enum", enum: UserStatus, default: UserStatus.OFFLINE})
	status: UserStatus;

	@Column("int", { nullable: true, array: true })
	blocked_ids: number[] | null;

	public defineAvatar() {
		this.avatar = this.getAvatarURL();
	}

	public getAvatarURL() {
		return `${process.env.API_URL}/users/avatar/${this.id}/id`;
	}

	public isBlockedUser(userId: number) {
		return this.blocked_ids && this.blocked_ids.indexOf(userId) !== -1;
	}
}
