import { defineStore } from 'pinia';
import UserService from '@/services/UserService';
import type GlobalState from '@/types/GlobalState';
import type User from '@/types/User';
import type Channel from '@/types/Channel';
import type Notification from '@/types/Notification';
import { NotificationType } from '@/types/Notification';
import type LeaderboardUser from '@/types/Leaderboard';
import type { UserStatus } from '@/types/User';

type selectedItems = User[] | Channel[];
type selectedItem = User | Channel;

export const useGlobalStore = defineStore('globalStore', {
	state: (): GlobalState => ({
		users: [],
		friends: [],
		pendingFriends: [],
		blockedUsers: [],
		leaderboard: [],
		leaderboardFriends: [],
		notifications: [],
		selectedItems: [],
	}),
	getters: {
		isTypeArrayUsers: (state) => {
			return (array: selectedItems): array is User[] => (array as User[])[0] === undefined || (array as User[])[0].username !== undefined;
		},
		isTypeUser: (state) => {
			return (user: selectedItem): user is User => (user as User).username !== undefined;
		},
		isFriend: (state) => {
			return (userId: number) => state.friends.some((friend) => friend.id === userId);
		},
		isPendingFriend: (state) => {
			return (userId: number) => state.pendingFriends.some((pendingFriend) => pendingFriend.id === userId);
		},
		isBlockedUser: (state) => {
			return (userId: number) => state.blockedUsers.some((blockedUser) => blockedUser.id === userId);
		},
		// getUserName: (state) => {
		// 	return (idSender: number) => state.users.find((user) => user.id === idSender)?.username;
		// },
		// getUserAvatar: (state) => {
		// 	return (idSender: number) => state.users.find((user) => user.id === idSender)?.avatar;
		// },
		// getUserId: (state) => {
		// 	return (idSender: number) => state.users.find((user) => user.id === idSender)?.id;
		// },
		getUser: (state) => {
			return (userId: number) => state.users.find((user) => user.id === userId);  //TODO remove
		},
		getIndexSelectedItems: (state) => {
			return  (user: User) => state.selectedItems.findIndex((userSelectioned) => userSelectioned.id === user.id);
		},
		// getUsersFiltered: (state) => {
		// 	return  (userToFilter: User) => state.users.filter((user) => user.id != userToFilter.id);
		// },
	},
	actions: {
		async fetchAll() {
			try {
				await Promise.all([this.fetchUsers(), this.fetchfriends(), this.fetchPendingfriends(), this.fetchNotifications()]);
			} catch (error: any) {
				throw error;
			}
		},
		async fetchUsers() {
			if (!this.users.length)
			{
				try {
					const response = await UserService.getUsers();
					this.users = response.data;
				} catch (error: any) {
					throw error;
				}
			}
		},
		async fetchfriends() {
			if (!this.friends.length)
			{
				try {
					const response = await UserService.getFriends();
					this.friends = response.data;
				} catch (error: any) {
					throw error;
				}
			}
		},
		async fetchPendingfriends() {
			if (!this.pendingFriends.length)
			{
				try {
					const response = await UserService.getPendingFriends();
					this.pendingFriends = response.data;
				} catch (error: any) {
					throw error;
				}
			}
		},
		async fetchNotifications() {
			if (!this.notifications.length)
			{
				try {
					const response = await UserService.getNotifications();
					this.notifications = response.data;
				} catch (error: any) {
					throw error;
				}
			}
		},
		async fetchLeaderboard() {
			try {
				const response = await UserService.getLeaderboard();
				this.leaderboard = response.data.leaderBoard;
				this.leaderboardFriends = response.data.leaderBoardFriends;
			} catch (error: any) {
					throw error;
			}
		},
		checkChangeInArray(baseArray: User[]) {
			let unlisted: User[] = [];
			let listed: User[] = [];
			if (baseArray) {
				for (const userBa of baseArray) {
					const index = this.getIndexSelectedItems(userBa);
					if (index < 0) unlisted.push(userBa);
				}
				for (const selectedUser of this.selectedItems) {
					const index = baseArray.findIndex((user) => user.id === selectedUser.id);
					if (index < 0 && this.isTypeUser(selectedUser)) listed.push(selectedUser);
				}
				return (unlisted.length || listed.length) ? { unlisted, listed } : null
			}
			if (this.isTypeArrayUsers(this.selectedItems)) listed = this.selectedItems
			return listed.length ? { unlisted, listed } : null
		},
		resetSelectedItems() {
			this.selectedItems = []
		},
		// addUser(user: User) {
		// 	this.users.push(user);
		// },
		addFriend(friend: User) {
			this.removePendingFriend(friend.id)
			this.addFriendToLeaderboard(friend.id)
			this.friends.push(friend);
		},
		addPendingFriend(pendingFriend: User) {
			this.pendingFriends.push(pendingFriend);
		},
		addBlockedUser(blockedUser: User) {
			this.blockedUsers.push(blockedUser);
		},
		addNotification(notification: Notification) {
			this.notifications.push(notification);
		},
		// removeUser(userToRemoveId: number) {
		// 	const index = this.users.findIndex(user => user.id === userToRemoveId);
		// 	this.users.splice(index, 1);
		// },
		removeFriend(friendToRemoveId: number) {
			this.removePendingFriend(friendToRemoveId)
			this.removeFriendToLeaderboard(friendToRemoveId)
			const index = this.friends.findIndex(friend => friend.id === friendToRemoveId);
			if (index !== -1) this.friends.splice(index, 1);
		},
		removePendingFriend(pendingFriendToRemoveId: number) {
			const index = this.pendingFriends.findIndex(pendingFriend => pendingFriend.id === pendingFriendToRemoveId);
			if (index !== -1) this.pendingFriends.splice(index, 1);
		},
		removeBlockedUser(blockedUserToRemoveId: number) {
			const index = this.blockedUsers.findIndex(blockedUser => blockedUser.id === blockedUserToRemoveId);
			if (index !== -1) this.blockedUsers.splice(index, 1);
		},
		removeNotification(notificationToRemoveId: number) {
			const index = this.notifications.findIndex(notification => notification.id === notificationToRemoveId);
			if (index !== -1) this.notifications.splice(index, 1);
		},
		removeNotificationByUserId(userId: number) {
			const index = this.notifications.findIndex(notification => notification.from_user_id === userId);
			if (index !== -1) this.notifications.splice(index, 1);
		},
		removeNotActionNotification() {
			this.notifications.filter(notification => notification.type == NotificationType.FRIEND_ACCEPT).forEach(notification => this.notifications.splice(this.notifications.indexOf(notification), 1));
		},
		addFriendToLeaderboard(userId: number) {
			const user = this.leaderboard.find((user) => user.id === userId)
			if (user) this.leaderboardFriends.push(user)
		},
		removeFriendToLeaderboard(userId: number) {
			const index = this.leaderboardFriends.findIndex(friend => friend.id === userId);
			if (index !== -1) this.leaderboardFriends.splice(index, 1);
		},
		updateLeaderboard(data: { leaderBoard: LeaderboardUser[], leaderBoardFriends: LeaderboardUser[] }) {
			this.leaderboard = data.leaderBoard;
			this.leaderboardFriends = data.leaderBoardFriends;
		},
		updateLeaderboardStatus(target: UserStatus) {
			if (this.leaderboard) {
				const index = this.leaderboard.findIndex((user) => user.id === target.id);
				if (index !== -1) this.leaderboard[index].status = target.status;
			}
			if (this.leaderboardFriends) {
				const index = this.leaderboardFriends.findIndex((user) => user.id === target.id);
				if (index !== -1) this.leaderboardFriends[index].status = target.status;
			}
		}
		// updateUser(userToChange: User) {
		// 	const index = this.users.findIndex(user => user.id === userToChange.id);
		// 	this.users[index] = userToChange
		// 	if (this.isFriend(userToChange.id))
		// 	{
		// 		const index = this.friends.findIndex(friend => friend.id === userToChange.id);
		// 		this.users[index] = userToChange
		// 	}
		// }

	}
});
