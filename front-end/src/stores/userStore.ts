import { defineStore } from 'pinia';
import type { UserState, Auth } from '@/types/UserState';
import AuthService from '@/services/AuthService';
import UserService from '@/services/UserService';
import TokenService from '@/services/TokenService';
import type User from '@/types/User';
import status from '@/types/Status';
import socket from '@/plugin/socketInstance';

export const useUserStore = defineStore('userStore', {
	state: (): UserState => ({
		userToken: TokenService.isLocalToken() ? TokenService.getLocalToken() : null,
		userAuth: {} as Auth,
		userData: {} as User,
	}),
	getters: {
		isLoggedIn: (state) => state.userToken !== null,
		isRegistered: (state) => state.userData.username !== null,
		isLoaded: (state) => state.userData.id !== undefined && state.userData.username !== undefined && state.userData.avatar !== undefined
	},
	actions: {
		saveToken() {
			TokenService.setLocalToken(this.userAuth.token_jwt)
			this.userToken = this.userAuth.token_jwt
			console.log(this.userToken)
		},
		async handleLogin(code: string) {
			try {
				const data = await AuthService.login(code);
				this.userAuth = data.auth;
				console.log(this.userAuth)
				if (!this.userAuth.has_2fa)
				{
					this.userData = data.user;
					console.log(this.userData)
					if (this.isRegistered && !this.userAuth.has_2fa) this.saveToken()
				}
			} catch (error: any) {
				throw error;
			}
		},
		async handleFakeLogin(username: string) {
			try {
				const data = await AuthService.fakeLogin(username);
				this.userAuth = data.auth;
				console.log(this.userAuth)
				if (!this.userAuth.has_2fa)
				{
					this.userData = data.user;
					console.log(this.userData)
					if (this.isRegistered && !this.userAuth.has_2fa) this.saveToken()
				}
			} catch (error: any) {
				console.log('ERROR FAKE LOGIN')
				throw error;
			}
		},
		async handleLogin2Fa(twoFaCode: string) {
			try {
				const data = await AuthService.login2FA(twoFaCode);
				this.userAuth = data.auth;
				this.userData = data.user;
				this.saveToken()
			} catch (error: any) {
				throw error;
			}
		},
		handleLogout() {
			socket.emit('update_status', status.OFFLINE )
			TokenService.removeLocalToken()
			location.reload()
		},
		async registerUser(newUsername: string, newAvatar: string) {
			try {
				await UserService.registerUser(newUsername, newAvatar);
				this.userData.username = newUsername;
				this.userData.avatar = newAvatar;
				this.saveToken()
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
	},
});
