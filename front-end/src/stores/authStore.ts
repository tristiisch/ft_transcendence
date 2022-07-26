import { defineStore } from 'pinia';
import AuthService from '@/services/AuthService';
import type { AuthState, AuthUser } from '@/types/User';

const userString = localStorage.getItem('user');

export const useAuthStore = defineStore('authStore', {
	state: (): AuthState => ({
		isAuthenticated: userString ? true : false,
		user: userString ? JSON.parse(userString) : ({} as AuthUser),
		isLoading: false,
	}),
	getters: {},
	actions: {
		async handleLogin(code: string, state: string) {
			try {
				this.user = await AuthService.login(code, state);
				this.user.username = this.user.id
				console.log(this.user);
				this.isAuthenticated = true;
			} catch (error) {
				console.log('error in store');
				console.log(error);
			}
			this.isLoading = false;
		},
		handlelogout() {
			localStorage.removeItem('user');
			location.reload()
		},
	},
});
