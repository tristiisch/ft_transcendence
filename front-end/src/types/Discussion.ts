import type User from '@/types/User';
import type Message from '@/types/Message';

export default interface Discussion {
	user: User,
	messages: Message[]
}
