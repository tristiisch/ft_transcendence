import { defineStore } from 'pinia';
import UserService from '@/services/UserService';
import type GlobalState from '@/types/GlobalState';
import type User from '@/types/User';
import type Channel from '@/types/Channel';
import type Notification from '@/types/Notification';
import { NotificationType } from '@/types/Notification';

type selectedItems = User[] | Channel[];
type selectedItem = User | Channel;

export const useGlobalStore = defineStore('globalStore', {
	state: (): GlobalState => ({
		users: [],
		friends: [],
		pendingFriends: [],
		blockedUsers: [],
		notifications: [],
		selectedItems: [],
		ballSpeed: 100,
		racketSize: 100,
		increaseSpeed: false,
		world: 1,
		winningScore: 5,
		gameInvitation: false,
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
				await Promise.all([this.fetchfriends(), this.fetchPendingfriends(), this.fetchNotifications(), this.fetchblockedUsers()]);
			} catch (error: any) {
				throw error;
			}
		},
		async fetchUsers() {
			try {
				const response = await UserService.getUsers();
				this.users = response.data;
			} catch (error: any) {
				throw error;
			}
		},
		async fetchfriends() {
			try {
				const response = await UserService.getFriends();
				this.friends = response.data;
			} catch (error: any) {
				throw error;
			}
		},
		async fetchPendingfriends() {
			try {
				const response = await UserService.getPendingFriends();
				this.pendingFriends = response.data;
			} catch (error: any) {
				throw error;
			}
		},
		async fetchblockedUsers() {
			try {
				const response = await UserService.getBlockedUsers();
				this.blockedUsers = response.data;
			} catch (error: any) {
				throw error;
			}
		},
		async fetchNotifications() {
			try {
				const response = await UserService.getNotifications();
				this.notifications = response.data;
			} catch (error: any) {
				throw error;
			}
		},
		checkChangeInArray(baseArray: User[]) {
			if (baseArray) {
				for (const userBa of baseArray) {
					const index = this.getIndexSelectedItems(userBa);
					if (index < 0) return 1
				}
				for (const selectedUser of this.selectedItems) {
					const index = baseArray.findIndex((user) => user.id === selectedUser.id);
					if (index < 0 && this.isTypeUser(selectedUser)) return 1;
				}
				return 0
			}
			if (this.isTypeArrayUsers(this.selectedItems))
				return this.selectedItems.length ? 1 : 0
		},
		resetSelectedItems() {
			this.selectedItems = []
		},
		// addUser(user: User) {
		// 	this.users.push(user);
		// },
		addFriend(friend: User) {
			this.removePendingFriend(friend.id)
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
			this.notifications.filter(notification => notification.type == NotificationType.FRIEND_ACCEPT 
				|| notification.type == NotificationType.FRIEND_DECLINE 
				|| notification.type == NotificationType.FRIEND_REMOVE
				|| notification.type == NotificationType.MATCH_DECLINE)
				.forEach(notification => this.notifications.splice(this.notifications.indexOf(notification), 1));
		},
		removeNotifCancel(notif: Notification, notifType: NotificationType) {
			this.notifications = this.notifications.filter(notification => notification.from_user_id !== notif.from_user_id
				&& notification.type !== notifType);
		},
	}
});
