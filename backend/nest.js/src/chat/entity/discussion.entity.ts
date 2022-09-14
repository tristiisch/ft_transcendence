import { NotAcceptableException } from "@nestjs/common";
import { ChatService } from "chat/chat.service";
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
			messages: await chatService.fetchMessage(this.id)
		}
		return discuFront;
	}
}

export class DiscussionFront {

	id?: number;
	type: ChatStatus;
	user: User;
	messages?: MessageFront[];
}
