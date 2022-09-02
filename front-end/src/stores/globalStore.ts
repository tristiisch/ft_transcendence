import { defineStore } from 'pinia';
import { useUserStore } from '@/stores/userStore';
import UserService from '@/services/UserService';
import type GlobalState from '@/types/GlobalState';
import type User from '@/types/User';
import type Channel from '@/types/Channel';

type selectedItems = User[] | Channel[];
type selectedItem = User | Channel;

const userStore = useUserStore();

export const useGlobalStore = defineStore('globalStore', {
	state: (): GlobalState => ({
		users: [],
		friends: [],
		channels: [],
		selectedItems: []
	}),
	getters: {
		isTypeArrayUsers: (state) => {
			return (array: selectedItems): array is User[] => (array as User[])[0] === undefined || (array as User[])[0].username !== undefined;
		},
		isTypeUser: (state) => {
			return (user: selectedItem): user is User => (user as User).username !== undefined;
		},
		getUserName: (state) => {
			return (senderId: number) => state.users.find((user) => user.id === senderId)?.username;
		},
		getUserAvatar: (state) => {
			return (senderId: number) => state.users.find((user) => user.id === senderId)?.avatar;
		},
		getUserId: (state) => {
			return (senderId: number) => state.users.find((user) => user.id === senderId)?.id;
		},
		getUser: (state) => {
			return (userId: number) => state.users.find((user) => user.id === userId);
		},
		getIndexChannels: (state) => { 
			return  (inChannel: Channel) => state.channels.findIndex((channel) => channel.name === inChannel.name);
		},
		getIndexSelectedItems: (state) => { 
			return  (user: User) => state.selectedItems.findIndex((userSelectioned) => userSelectioned.id === user.id);
		},
		getUsersFiltered: (state) => { 
			return  (userToFilter: User) => state.users.filter((user) => user.id != userToFilter.id);
		},
		getChannelsFiltered: (state) => { 
			return  (channelsToFilter: Channel[]) => state.channels.filter((channel) => !channelsToFilter.includes(channel));
		},
	},
    actions: {
		async fetchUsers() {
			try {
				const response = await UserService.getUsers();
				this.users = response.data;
			} catch (error: any) {
				throw error;
			}
		},
		async fetchChannels() {
			try {
				const response = await UserService.getChannels();
				this.channels = response.data;
			} catch (error: any) {
				throw error;
			}
		},
		async fetchfriends() {
			try {
				const response = await UserService.getUserfriends(userStore.userData.id);
				this.friends = response.data;
			} catch (error: any) {
				throw error;
			}
		},
		checkChangeInArray(baseArray: User[]) {
			for (const userBa of baseArray) {
				const index = this.getIndexSelectedItems(userBa);
				if (index < 0) return true;
			}
			for (const selectedUser of this.selectedItems) {
				const index = baseArray.findIndex((user) => user.id === selectedUser.id);
				if (index < 0) return true;
			}
			return false;
		},
		resetSelectedItems() {
			this.selectedItems = []
		}
    }
});
	