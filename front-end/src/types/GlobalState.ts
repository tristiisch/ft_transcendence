import type User from '@/types/User';
import type Channel from '@/types/Channel';
import type Notification from '@/types/Notification';

export interface GlobalState {
	users: User[];
	friends: number[];
	pendingFriends: number[],
	notifications: Notification[],
	selectedItems: User[] | Channel[];
}

export default GlobalState;
