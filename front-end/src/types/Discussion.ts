import type User from '@/types/User';
import type { Chat } from './Channel';

export default interface Discussion extends Chat {
	user: User,
}
