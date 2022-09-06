import type User from '@/types/User';
import type Channel from '@/types/Channel';
import type Notification from '@/types/Notification';

export interface GlobalState {
	users: User[];
	friends: User[];
	pendingFriends: User[],
	notifications: Notification[],
	selectedItems: User[] | Channel[];
	isLoading: boolean
}

export default GlobalState;
