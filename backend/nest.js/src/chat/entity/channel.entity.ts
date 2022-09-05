import { ChildEntity, Column } from "typeorm";
import { User } from "users/entity/user.entity";
import { Chat, ChatFront } from "./chat.entity";

@ChildEntity()
export class Channel extends Chat {

	@Column({ unique: true })
	name: string;

	@Column()
	owner_id: number;

	@Column()
	avatar_64: string;

	@Column()
	password: string | null;

	@Column("int", { nullable: true, array: true })
	admins_ids: number[];

	@Column("int", { nullable: true, array: true })
	muted_ids: number[];

	@Column("int", { nullable: true, array: true })
	banned_ids: number[];
}

export class ChannelFront extends ChatFront {

	name: string;
	owner: User;
	avatar: string;
	password: string | null;
	users: User[];
	admins: User[];
	muted: User[];
	banned: User[];
}
