/** @prettier */
import { IsNotEmpty } from 'class-validator';
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

	@Column()
	@IsNotEmpty()
	login_42: string;

	@Column({ unique: true, nullable: true })
	@IsNotEmpty()
	username: string;

	avatar: string;

	@Column({ nullable: true })
	avatar_64: string;

	@Column({ type: "enum", enum: UserStatus, default: UserStatus.OFFLINE})
	status: UserStatus;

	public defineAvatar() {
		this.avatar = this.getAvatarURL();
	}

	public getAvatarURL() {
		return `${process.env.API_URL}/users/avatar/${this.id}/id`;
	}
}
