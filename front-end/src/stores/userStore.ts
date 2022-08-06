import { defineStore } from 'pinia';
import AuthService from '@/services/AuthService';
import UsersService from '@/services/UserService';
import type { UserState } from '@/types/User';
import type User from '@/types/User';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import type { AxiosError } from 'axios';

const authString = localStorage.getItem('userAuth');
const userString = localStorage.getItem('userData');

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
			} catch (error: unknown) {
				throw error;
			}
			this.isLoading = false;
		},
		handlelogout() {
			localStorage.removeItem('userAuth');
			localStorage.removeItem('userData');
			location.reload();
		},
		async handleTwoFaAuthentification(twoFaCode: string) {
			try {
				const response = await AuthService.login2FA(twoFaCode);
				localStorage.removeItem('userData');
				localStorage.setItem('userData', JSON.stringify(response.data));
			} catch (error: unknown) {
				throw error;
			}
		},
		async updateUsername(username: string) {
			try {
				this.userData.username = username;
				console.log(username);
				await UsersService.setUsername(this.userAuth.id, this.userData.username);
				if (this.userAuth.isRegistered === false) {
					this.userAuth.isRegistered = true;
					localStorage.setItem('userAuth', JSON.stringify(this.userAuth));
				}
			} catch (error: unknown) {
				throw error;
			}
		},
		async updateAvatar(image: string) {
			try {
				console.log(image);
				await UsersService.setAvatar(this.userAuth.id, this.userData.avatar);
				this.userData.avatar = image;
				localStorage.setItem('userData', JSON.stringify(this.userData));
			} catch (error: unknown) {
				throw error;
			}
		},
	},
});
