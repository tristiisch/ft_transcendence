import { defineStore } from 'pinia';
import type { UserState } from '@/types/UserState';
import AuthService from '@/services/AuthService';
import UserService from '@/services/UserService';
import type User from '@/types/User';
import router from '@/router/index'

export const useUserStore = defineStore('userStore', {
	state: (): UserState => ({
		userAuth: { token_jwt: AuthService.getJwtToken() },
		userData: {} as User,
	}),
	getters: {
		isLoggedIn: (state) => state.userAuth.token_jwt !== null,
		isRegistered: (state) => state.userData.username !== null,
	},
	actions: {
		verifyState(state: string) {
			const randomString = localStorage.getItem('state')
			localStorage.removeItem('state');
			if (!randomString || randomString && state !== JSON.parse(randomString))
				throw new Error('State is not valid')
		},
		async handleLogin(code: string, state: string) {
			try {
				this.verifyState(state);
				const data = await AuthService.login(code);
				this.userAuth = data.auth;
				console.log(this.userAuth);
				if (!this.userAuth.has_2fa)
				{
					this.userData = data.user;
					console.log(this.userData)
					if (this.isRegistered && !this.userAuth.has_2fa)
						localStorage.setItem('userAuth', JSON.stringify(this.userAuth.token_jwt));
				}
			} catch (error: any) {
				throw error;
			}
		},
		async handleFakeLogin(username: string) {
			try {
				const data = await AuthService.fakeLogin(username);
				this.userAuth = data.auth;
				console.log(this.userAuth);
				if (!this.userAuth.has_2fa)
				{
					this.userData = data.user;
					console.log(this.userData);
					if (this.isRegistered && !this.userAuth.has_2fa)
						localStorage.setItem('userAuth', JSON.stringify(this.userAuth.token_jwt));
				}
			} catch (error: any) {
				throw error;
			}
		},
		async handleLogin2Fa(twoFaCode: string) {
			try {
				const data = await AuthService.login2FA(twoFaCode);
				this.userAuth = data.auth;
				this.userData = data.user;
				localStorage.setItem('userAuth', JSON.stringify(this.userAuth.token_jwt));
			} catch (error: any) {
				throw error;
			}
		},
		handleLogout() {
			localStorage.clear();
			this.$reset();
			router.push({ path: '/' });
		},
		async registerUser(newUsername: string, newAvatar: string) {
			try {
				await UserService.registerUser(newUsername, newAvatar);
				this.userData.username = newUsername;
				this.userData.avatar = newAvatar;
				localStorage.setItem('userAuth', JSON.stringify(this.userAuth.token_jwt));
			} catch (error: any) {
				throw error;
			}
		},
		async fetchAll() {
			try {
				await Promise.all([this.fetchMe(), this.fetchAuth()])
			} catch (error: any) {
				throw error;
			}
		},
		async fetchMe() {
			try {
				const response = await UserService.getMe();
				this.userData = response.data;
			} catch (error: any) {
				throw error;
			}
		},
		async fetchAuth() {
			try {
				const response = await AuthService.getAuth();
				this.userAuth = response.data;
			} catch (error: any) {
				throw error;
			}
		},
		update2FA(value: boolean) {
			this.userAuth.has_2fa = value;
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
		async deleteAccount() {
			try {
				const res = await UserService.deleteAccount();
				this.userData = res.data;
			} catch (error: any) {
				throw error;
			}
		},
	},
});
