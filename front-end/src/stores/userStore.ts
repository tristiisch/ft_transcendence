import { defineStore } from 'pinia';
import AuthService from '@/services/AuthService';
import UsersService from '@/services/UserService';
import type { UserState } from '@/types/User';
import type User from '@/types/User';

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
		async handleLogin(code: string, state: string) {
			try {
				this.userAuth = await AuthService.login(code, state);
				this.userData = await UsersService.getMyData(this.userAuth.id);
				if (!this.userData.username) {
					this.userData.username = this.userAuth.id as string;
					this.userAuth.isRegistered = false;
				} else this.userAuth.isRegistered = true;
				if (!this.userData['2fa'])
					this.userAuth.isAuthenticated = true;
				else this.userAuth.isAuthenticated = false;
				localStorage.setItem('userAuth', JSON.stringify(this.userAuth));
				localStorage.setItem('userData', JSON.stringify(this.userData));
				console.log(this.userAuth);
			} catch (error: unknown) {
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
		async updateUsername(username: string) {
			try {
				this.userData.username = username;
				console.log(username);
				await UsersService.setUsername(this.userAuth.id, this.userData.username);
				localStorage.setItem('userData', JSON.stringify(this.userData));
			} catch (error: unknown) {
				throw error;
			}
		},
		async updateAvatar(image: string) {
			try {
				console.log(image);
				this.userData.avatar = image;
				await UsersService.setAvatar(this.userAuth.id, this.userData.avatar);
				localStorage.setItem('userData', JSON.stringify(this.userData));
			} catch (error: unknown) {
				throw error;
			}
		},
		registerUser() {
			this.userAuth.isRegistered = true;
			localStorage.setItem('userAuth', JSON.stringify(this.userAuth));
		},
		authenticateUser() {
			this.userAuth.isAuthenticated = true;
			localStorage.setItem('userAuth', JSON.stringify(this.userAuth));
		}
	},
});
