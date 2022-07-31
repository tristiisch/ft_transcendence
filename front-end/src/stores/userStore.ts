import { defineStore } from 'pinia';
import AuthService from '@/services/AuthService';
import UsersService from '@/services/UserService';
import type { UserState } from '@/types/User';
import type User from '@/types/User';
import axios from '@/api/axios';

const authString = localStorage.getItem('userAuth');
const userString = localStorage.getItem('userData');

if (authString) {
	const token = JSON.parse(authString).accessToken;
	axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const useUserStore = defineStore('userStore', {
	state: (): UserState => ({
		userAuth: authString ? JSON.parse(authString) : null,
		isLoading: false,
		userData: userString ? JSON.parse(userString) : ({} as User),
	}),
	getters: {
		isLoggedIn: (state) => state.userAuth !== null,
		isRegistered: (state) => state.userAuth !== null && state.userAuth.isRegistered !== false,
	},
	actions: {
		async handleLogin(code: string, state: string) {
			try {
				this.isLoading = true;
				this.userAuth = await AuthService.login(code, state);
				this.userData = await UsersService.getMyData(this.userAuth.id);
				if (!this.userData.username) {
					this.userData.username = this.userAuth.id as string;
					this.userAuth.isRegistered = false;
				} else this.userAuth.isRegistered = true;
				localStorage.setItem('userAuth', JSON.stringify(this.userAuth));
				localStorage.setItem('userData', JSON.stringify(this.userData));
				console.log(this.userAuth);
			} catch (error) {
				console.log('error in store');
				console.log(error);
			}
			this.isLoading = false;
		},
		handlelogout() {
			localStorage.removeItem('userAuth');
			localStorage.removeItem('userData');
			location.reload();
		},
	},
});
