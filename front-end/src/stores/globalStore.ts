import { defineStore } from 'pinia';
import UserService from '@/services/UserService';
import type GlobalState from '@/types/GlobalState';
import type User from '@/types/User';
import type Channel from '@/types/Channel';
import type Notification from '@/types/Notification';

type selectedItems = User[] | Channel[];
type selectedItem = User | Channel;

export const useGlobalStore = defineStore('globalStore', {
	state: (): GlobalState => ({
		users: [],
		friends: [],
		pendingFriends: [],
		notifications: [],
		selectedItems: [],
		isLoading: false
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
			return (userId: number) => state.pendingFriends.some((pending) => pending.id === userId);
		},
		getUserName: (state) => {
			return (idSender: number) => state.users.find((user) => user.id === idSender)?.username;
		},
		getUserAvatar: (state) => {
			return (idSender: number) => state.users.find((user) => user.id === idSender)?.avatar;
		},
		getUserId: (state) => {
			return (idSender: number) => state.users.find((user) => user.id === idSender)?.id;
		},
		getUser: (state) => {
			return (userId: number) => state.users.find((user) => user.id === userId);
		},
		getIndexSelectedItems: (state) => {
			return  (user: User) => state.selectedItems.findIndex((userSelectioned) => userSelectioned.id === user.id);
		},
		getUsersFiltered: (state) => {
			return  (userToFilter: User) => state.users.filter((user) => user.id != userToFilter.id);
		},
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
		checkChangeInArray(baseArray: User[]) {
			let unlisted: User[] = [];
			let listed: User[] = [];
			for (const userBa of baseArray) {
				const index = this.getIndexSelectedItems(userBa);
				if (index < 0) unlisted.push(userBa);
			}
			for (const selectedUser of this.selectedItems) {
				const index = baseArray.findIndex((user) => user.id === selectedUser.id);
				if (index < 0 && this.isTypeUser(selectedUser)) listed.push(selectedUser);
			}
			return (unlisted.length || listed.length) ? { unlisted, listed } : null
		},
		resetSelectedItems() {
			this.selectedItems = []
		},
		addUser(user: User) {
			this.users.push(user);
		},
		addFriend(friendId: number) {
			this.removePendingFriend(friendId)
			const friend = this.getUser(friendId)
			if (friend) this.friends.push(friend);
		},
		addPendingFriend(pendingFriendId: number) {
			const pendingFriend = this.getUser(pendingFriendId)
			if (pendingFriend) this.pendingFriends.push(pendingFriend);
		},
		addNotification(notification: Notification) {
			this.notifications.push(notification);
		},
		removeUser(userToRemoveId: number) {
			const index = this.users.findIndex(user => user.id === userToRemoveId);
			this.users.splice(index, 1);
		},
		removeFriend(friendToRemoveId: number) {
			this.removePendingFriend(friendToRemoveId)
			const index = this.friends.findIndex(friend => friend.id === friendToRemoveId);
			this.friends.splice(index, 1);
		},
		removePendingFriend(pendingFriendToRemoveId: number) {
			const index = this.pendingFriends.findIndex(pendingFriend => pendingFriend.id === pendingFriendToRemoveId);
			this.pendingFriends.splice(index, 1);
		},
		removeNotification(notificationToRemoveId: number) {
			const index = this.notifications.findIndex(notification => notification.id === notificationToRemoveId);
			this.notifications.splice(index, 1);
		},
		updateUser(userToChange: User) {
			const index = this.users.findIndex(user => user.id === userToChange.id);
			this.users[index] = userToChange
			if (this.isFriend(userToChange.id))
			{
				const index = this.friends.findIndex(friend => friend.id === userToChange.id);
				this.users[index] = userToChange
			}
		}

	}
});
