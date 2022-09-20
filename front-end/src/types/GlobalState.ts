import type User from '@/types/User';
import type Channel from '@/types/Channel';
import type Notification from '@/types/Notification';
import type LeaderboardUser from '@/types/Leaderboard';

export interface GlobalState {
	users: User[],
	friends: User[],
	pendingFriends: User[],
	blockedUsers: User[],
	leaderboard: LeaderboardUser[],
	leaderboardFriends: LeaderboardUser[],
	notifications: Notification[],
	selectedItems: User[] | Channel[];
}

export default GlobalState;
