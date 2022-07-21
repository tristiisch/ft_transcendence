import { defineStore } from 'pinia';
import type User from '@/types/User';
import Status from '@/types/Status';
import UsersService from '@/services/UserService';

export const useUserStore = defineStore('userStore', {
	state: () => ({
		user: {
			id: 3,
			username: 'Aragorn',
			rank: 4,
			nbVictory: 0,
			nbDefeat: 100,
			avatar: 'https://avatarfiles.alphacoders.com/257/257355.jpg',
			'2fa': '',
			'42token': '',
			created: '',
			register_ip: '',
			current_status: Status.OFFLINE,
			last_connection: '',
		},
	}),
	getters: {
		getUser: (state) => state.user,
		getId: (state) => state.user.id,
		getUsername: (state) => state.user.username,
		getRank: (state) => state.user.rank,
		getnbVictory: (state) => state.user.nbVictory,
		getnbDefeat: (state) => state.user.nbDefeat,
		getAvatar: (state) => state.user.avatar,
		get2fa: (state) => state.user['2fa'],
		get42token: (state) => state.user['42token'],
		getCreated: (state) => state.user.created,
		getRegisterIp: (state) => state.user.register_ip,
		getCurrentStatus: (state) => state.user.current_status,
		getLastConnection: (state) => state.user.last_connection,
	},
	actions: {},
});
