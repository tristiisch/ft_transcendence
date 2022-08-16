import { IsEmail, IsInt, IsNotEmpty } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum FriendshipStatus {
	PENDING,
	ACCEPTED
}

@Entity()
export class Friendship {

	@PrimaryGeneratedColumn()
	id: number;

    @Column()
	@IsInt()
    user_id1: number;

    @Column()
	@IsInt()
    user_id2: number;

	@Column({ type: "enum", enum: FriendshipStatus, default: FriendshipStatus.PENDING})
	status: FriendshipStatus;
}
