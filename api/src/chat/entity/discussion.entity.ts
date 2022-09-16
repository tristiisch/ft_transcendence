import { NotAcceptableException } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { ChatService } from "chat/chat.service";
import { SocketService } from "socket/socket.service";
import { ChildEntity } from "typeorm";
import { User } from "users/entity/user.entity";
import { UsersService } from "users/users.service";
import { Chat, ChatStatus } from "./chat.entity";
import { MessageFront } from "./message.entity";


@ChildEntity(ChatStatus.DISCUSSION)
export class Discussion extends Chat {

	public async toFront?(chatService: ChatService, user: User, userCached: User[]): Promise<DiscussionFront> {
		if (this.users_ids == null || this.users_ids.length != 2)
			throw new NotAcceptableException(`Discussion ${this.id} is not set or didn't have 2 users.`);

		const targetId: number = this.users_ids[0] === user.id ? this.users_ids[1] : this.users_ids[0];
		const target: User = await chatService.getUserService().findOneWithCache(targetId, userCached);
	
		const discuFront: DiscussionFront = {
			type: ChatStatus.DISCUSSION,
			user: target,
			messages: await chatService.fetchMessage(user, this.id)
		}
		return discuFront;
	}

	public sendMessage?(socketService: SocketService, sender: User, room: string, ...args: any) {
		const targetId: number = this.getTarget(sender);
		if (sender.isBlockedUser(targetId))
			return;
		socketService.emitId(targetId, room, ...args);
	}

	public getTarget?(user: User): number {
		if (!this.users_ids || this.users_ids.length < 2)
			throw new WsException('Discussion length is not 2.');
		if (this.users_ids[0] !== user.id)
			return this.users_ids[0]
		return this.users_ids[1]
	}
}

export class DiscussionFront {

	id?: number;
	type: ChatStatus;
	user: User;
	messages?: MessageFront[];
}
