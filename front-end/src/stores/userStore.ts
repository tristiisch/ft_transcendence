import { defineStore } from 'pinia';
import AuthService from '@/services/AuthService';
import UsersService from '@/services/UserService';
import type { UserState } from '@/types/User';
import type User from '@/types/User';
import type { AxiosError } from 'axios';

const authString = localStorage.getItem('userAuth');
const userString = localStorage.getItem('userData');

export const useUserStore = defineStore('userStore', {
	state: (): UserState => ({
		userAuth: authString ? JSON.parse(authString) : null,
		userData: userString ? JSON.parse(userString) : ({} as User),
	}),
	getters: {
		isLoggedIn: (state) => state.userAuth !== null,
		isRegistered: (state) => state.userAuth !== null && state.userAuth.isRegistered !== false,
		isAuthenticated: (state) => state.userAuth !== null && state.userAuth.isAuthenticated !== false,
	},
	actions: {
		async handleLogin(code: string) {
			try {
				const data = await AuthService.login(code);
				this.userAuth = data.auth
				this.userData = data.user
				if (!this.userData.username) {
					this.userData.username = this.userData.login_42;
					this.userAuth.isRegistered = false;
				} else this.userAuth.isRegistered = true;
				if (!this.userAuth.has_2fa) this.userAuth.isAuthenticated = true;
				else this.userAuth.isAuthenticated = false;
				localStorage.setItem('userAuth', JSON.stringify(this.userAuth));
				localStorage.setItem('userData', JSON.stringify(this.userData));
			} catch (error: any) {
				throw error;
			}
		},
		handleLogout() {
			localStorage.removeItem('userAuth');
			localStorage.removeItem('userData');
			location.reload();
		},
		async handle2Fa(twoFaCode: string) {
			try {
				const token = await AuthService.login2FA(twoFaCode);
				this.userAuth.token = token;
				this.userAuth.isAuthenticated = true;
				localStorage.setItem('userAuth', JSON.stringify(this.userAuth));
			} catch (error: any) {
				throw error;
			}
		},
		async registerUser(username: string, image: string) {
			try {
				if (username)
					this.userData.username = username;
				if (image)
					this.userData.avatar = image;
				await AuthService.registerUser(this.userData.id, this.userData.username, this.userData.avatar);
				localStorage.setItem('userData', JSON.stringify(this.userData));
				this.userAuth.isRegistered = true;	
				localStorage.setItem('userAuth', JSON.stringify(this.userAuth));
			} catch (error: any) {
				throw error;
			}
		},
	},
});
