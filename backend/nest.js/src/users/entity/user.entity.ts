/** @prettier */
import { Exclude } from 'class-transformer';
import { IsEmail, IsInt, IsNotEmpty } from 'class-validator';
import { fromBase64 } from 'src/utils/utils';
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

	@Column({ unique: true, nullable: true, length: 32 })
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
		return `http://${'localhost'}:${process.env.PORT}/api/users/avatar/${this.id}/id`;
	}
}
