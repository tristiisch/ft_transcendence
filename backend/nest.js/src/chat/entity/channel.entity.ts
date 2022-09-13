import { ChatService } from "chat/chat.service";
import { ChildEntity, Column } from "typeorm";
import { User } from "users/entity/user.entity";
import { UsersService } from "users/users.service";
import { ChannelCreateDTO } from "./channel-dto";
import { Chat, ChatFront, ChatStatus } from "./chat.entity";

export class Channel extends Chat {

	name: string;
	owner_id: number;
	avatar: string;
	avatar_64: string;
	admins_ids: number[];
	muted_ids: number[];
	banned_ids: number[];

	public async toFront?(chatService: ChatService, user: User | null, usersCached: User[] | null): Promise<ChannelFront> {
		if (!usersCached)
			usersCached = new Array();
		const chFront: ChannelFront = {
			name: this.name,
			owner: await chatService.getUserService().findOneWithCache(this.owner_id, usersCached),
			avatar: `http://${'localhost'}:${process.env.PORT}/api/chat/avatar-${ChatStatus[this.type].toLowerCase()}/${this.id}`,
			password: null,
			hasPassword: false,
			users: await chatService.getUserService().arrayIdsToUsersWithCache(this.users_ids, usersCached),
			// users: this.users_ids,
			admins: await chatService.getUserService().arrayIdsToUsersWithCache(this.admins_ids, usersCached),
			muted: await chatService.getUserService().arrayIdsToUsersWithCache(this.muted_ids, usersCached),
			banned: await chatService.getUserService().arrayIdsToUsersWithCache(this.banned_ids, usersCached),
			id: this.id,
			type: this.type,
			messages: await chatService.fetchMessage(this.id)
		}
		return chFront;
	}
}

@ChildEntity(ChatStatus.PUBLIC)
export class ChannelPublic extends Channel {

	@Column({ unique: true })
	name: string;

	@Column()
	owner_id: number;

	@Column()
	avatar_64: string;

	@Column("int", { nullable: true, array: true })
	admins_ids: number[];

	@Column("int", { nullable: true, array: true })
	muted_ids: number[];

	@Column("int", { nullable: true, array: true })
	banned_ids: number[];

}

@ChildEntity(ChatStatus.PROTECTED)
export class ChannelProtected extends Channel {

	@Column({ unique: true })
	name: string;

	@Column()
	owner_id: number;

	@Column()
	avatar_64: string;

	@Column("int", { nullable: true, array: true })
	admins_ids: number[];

	@Column("int", { nullable: true, array: true })
	muted_ids: number[];

	@Column("int", { nullable: true, array: true })
	banned_ids: number[];

	@Column()
	password: string;

	public async toFront?(chatService: ChatService, user: User | null, usersCached: User[] | null): Promise<ChannelFront> {
		const chFront: ChannelFront = await super.toFront(chatService, user, usersCached);
		chFront.password = this.password; // TODO remove this
		chFront.hasPassword = true;
		return chFront;
	}
}

@ChildEntity(ChatStatus.PRIVATE)
export class ChannelPrivate extends Channel {

	@Column({ unique: true })
	name: string;

	@Column()
	owner_id: number;

	@Column()
	avatar_64: string;

	@Column("int", { nullable: true, array: true })
	admins_ids: number[];

	@Column("int", { nullable: true, array: true })
	muted_ids: number[];

	@Column("int", { nullable: true, array: true })
	banned_ids: number[];

	@Column("int", { nullable: true, array: true })
	invited_ids: number[];
}

export class ChannelFront extends ChatFront {

	name: string;
	owner: User;
	avatar: string;
	password: string | null;
	hasPassword: boolean;
	users: User[];
	admins: User[];
	muted: User[];
	banned: User[];
}
