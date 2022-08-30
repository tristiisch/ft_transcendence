import { User } from "src/users/entity/user.entity";
import { ChatStatus } from "./chat.entity";
import { MessageFront } from "./message.entity";

export class DiscussionFront {

	id?: number;
	type: ChatStatus;
	user: User;
	messages?: MessageFront[];
}
