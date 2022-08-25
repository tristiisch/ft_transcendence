import type User from '@/types/User';
import type Message from '@/types/Message';
import type { Chat } from './Channel';

export default interface Discussion extends Chat {
	user: User,
}
