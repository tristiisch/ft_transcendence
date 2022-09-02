import type User from '@/types/User';
import type Channel from '@/types/Channel';

export interface GlobalState {
	users: User[];
	friends: User[];
	channels: Channel[];
	selectedItems: User[] | Channel[];
}

export default GlobalState;
