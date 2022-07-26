import { defineStore } from 'pinia';
import AuthService from '@/services/AuthService';

interface AuthUser {
	id: string;
	token: string;
	username: string;
	avatar: string;
}
interface AuthState {
	isAuthenticated: boolean;
	user: AuthUser;
	isLoading: boolean;
}

const userString = localStorage.getItem('user');

export const useAuthStore = defineStore('authStore', {
	state: (): AuthState => ({
		isAuthenticated: userString ? true : false,
		user: userString ? JSON.parse(userString) : ({} as AuthUser),
		isLoading: false,
		//isReady: userString ? true : false
	}),
	getters: {},
	actions: {
		async handleLogin(code: string, state: string) {
			try {
				this.user = await AuthService.login(code, state);
				console.log(this.user);
				this.isAuthenticated = true;
			} catch (error) {
				console.log('error in store');
				console.log(error);
			}
			this.isLoading = false;
		},
		handlelogout() {
			//this.user = {} as AuthUser;
			localStorage.removeItem('user');
			//this.isAuthenticated = false;
			location.reload()

		},
	},
});
