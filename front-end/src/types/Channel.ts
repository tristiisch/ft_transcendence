import type User from '@/types/User';
import type Message from '@/types/Message';
import type ChatStatus from '@/types/ChatStatus';

export interface Chat {
	id?: number,
	type: ChatStatus,
	messages: Message[]
}

export default interface Channel extends Chat {
	name: string,
	owner: User | null,
	avatar: string,
	hasPassword: boolean,
	users: User[],
	admins: User[],
	muted: User[],
	banned: User[],
}