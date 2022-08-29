import { defineStore } from 'pinia';
import AuthService from '@/services/AuthService';
import UserService from '@/services/UserService';
import type { UserState } from '@/types/User';
import type User from '@/types/User';
import type { AxiosError } from 'axios';

const authString = localStorage.getItem('userAuth');

export const useUserStore = defineStore('userStore', {
	state: (): UserState => ({
		userAuth: authString ? JSON.parse(authString) : null,
		userData: {} as User,
	}),
	getters: {
		isLoggedIn: (state) => state.userAuth !== null && state.userAuth.token_jwt !== null,
		isRegistered: (state) => state.userAuth !== null && state.userData.username !== null,
	},
	actions: {
		async handleLogin(code: string) {
			try {
				const data = await AuthService.login(code);
				this.userAuth = data.auth;
				if (!this.userAuth.has_2fa)
				{
					this.userData = data.user;
					if (this.userData.username && !this.userAuth.has_2fa)
						localStorage.setItem('userAuth', JSON.stringify(this.userAuth));
				}
				console.log(this.userAuth)
				console.log(this.userData)
			} catch (error: any) {
				throw error;
			}
		},
		handleLogout() {
			localStorage.removeItem('userAuth');
			location.reload();
		},
		async handleLogin2Fa(twoFaCode: string) {
			try {
				const data = await AuthService.login2FA(twoFaCode);
				this.userAuth = data.auth;
				this.userData = data.user;
				localStorage.setItem('userAuth', JSON.stringify(this.userAuth));
			} catch (error: any) {
				throw error;
			}
		},
		async registerUser(newUsername: string, newAvatar: string) {
			try {
				await UserService.registerUser(newUsername, newAvatar);
				this.userData.username = newUsername;
				this.userData.avatar = newAvatar;
				localStorage.setItem('userAuth', JSON.stringify(this.userAuth));
			} catch (error: any) {
				throw error;
			}
		},
		update2FA(value: boolean) {
			this.userAuth.has_2fa = value;
			//localStorage.setItem('userAuth', JSON.stringify(this.userAuth));
		},
		async updateUsername(newUsername: string) {
			try {
				await UserService.updateUsename(newUsername);
				this.userData.username = newUsername;
			} catch (error: any) {
				throw error;
			}
		},
		async updateAvatar(newAvatar: string) {
			try {
				await UserService.updateAvatar(newAvatar);
				this.userData.avatar = newAvatar;
			} catch (error: any) {
				throw error;
			}
		},
	},
});
