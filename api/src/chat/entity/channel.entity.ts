import { UnauthorizedException } from "@nestjs/common";
import { ChatService } from "chat/chat.service";
import { SocketService } from "socket/socket.service";
import { ChildEntity, Column } from "typeorm";
import { User } from "users/entity/user.entity";
import { removeFromArray } from "utils/utils";
import { Chat, ChatFront, ChatStatus } from "./chat.entity";

export class Channel extends Chat {

	name: string;
	owner_id: number;
	avatar_64: string;
	admins_ids: number[] | null;
	muted_ids: number[] | null;
	banned_ids: number[] | null;

	public async toFront?(chatService: ChatService, user: User | null, usersCached: User[] | null): Promise<ChannelFront> {
		if (!usersCached)
			usersCached = new Array();
		const chFront: ChannelFront = {
			name: this.name,
			owner: await chatService.getUserService().findOneWithCache(this.owner_id, usersCached),
			avatar: `${process.env.VITE_API_URL}/chat/avatar-${ChatStatus[this.type].toLowerCase()}/${this.id}`,
			hasPassword: false,
			users: await chatService.getUserService().findManyWithCache(this.users_ids, usersCached),
			admins: await chatService.getUserService().findManyWithCache(this.admins_ids, usersCached),
			muted: await chatService.getUserService().findManyWithCache(this.muted_ids, usersCached),
			banned: await chatService.getUserService().findManyWithCache(this.banned_ids, usersCached),
			id: this.id,
			type: this.type,
			messages: await chatService.fetchMessage(user, this.id, usersCached)
		}
		return chFront;
	}

	public checkAdminPermission?(user: User) {
		if (!this.hasAdminPermission(user))
			throw new UnauthorizedException('You are not admin.');
	}

	public hasAdminPermission?(user: User): boolean {
		return this.owner_id === user.id || this.isAdmin(user);
	}

	public isAdmin?(user: User): boolean {
		return this.admins_ids && this.admins_ids.indexOf(user.id) !== -1;
	}

	public isMute?(user: User): boolean {
		return this.muted_ids && this.muted_ids.indexOf(user.id) !== -1;
	}

	public isBanned?(user: User): boolean {
		return this.banned_ids && this.banned_ids.indexOf(user.id) !== -1;
	}

	public isIn?(user: User): boolean {
		return this.users_ids && this.users_ids.indexOf(user.id) !== -1;
	}

	async sendMessage?(sockerService: SocketService, room: string, ...args: any) {
		if (!this.users_ids)
			return;
		await sockerService.emitIds(null, this.users_ids, room, ...args);
	}

	async sendMessageFrom?(sockerService: SocketService, user: User, room: string, ...args: any) {
		if (!this.users_ids)
			return;
		const emitUsers: number[] = this.users_ids.filter(u => u !== user.id);
		await sockerService.emitIds(user, emitUsers, room, ...args);
	}
}

@ChildEntity(ChatStatus.PUBLIC)
export class ChannelPublic extends Channel {

	@Column()
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

	@Column()
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
		chFront.hasPassword = true;
		return chFront;
	}
}

@ChildEntity(ChatStatus.PRIVATE)
export class ChannelPrivate extends Channel {

	@Column()
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

export class ChannelFront extends ChatFront {

	name: string;
	owner: User;
	avatar: string;
	hasPassword: boolean;
	users: User[];
	admins: User[];
	muted: User[];
	banned: User[];
}
