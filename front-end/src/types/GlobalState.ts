import type User from '@/types/User';
import type Channel from '@/types/Channel';
import type Notification from '@/types/Notification';

export interface GlobalState {
	users: User[],
	friends: User[],
	pendingFriends: User[],
	blockedUsers: User[],
	notifications: Notification[],
	selectedItems: User[] | Channel[];
	ballSpeed: number,
	racketSize: number,
	increaseSpeed: boolean,
	world: number,
	neededPointsForVictory: number,
	gameInvitation: boolean,
	invitedUser?: User
}

export default GlobalState;
