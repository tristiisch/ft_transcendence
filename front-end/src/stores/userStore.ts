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
				const response = await AuthService.login(code, state);
				console.log(response)
				this.userAuth = response.auth
				this.userData = response.user
				console.log(this.userData.username)
				if (!this.userData.username) {
					this.userData.username = this.userData.login_42;
					this.userAuth.isRegistered = false;
				} else this.userAuth.isRegistered = true;
				console.log(this.userData.username)
				if (!this.userAuth.has_2fa)
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
		async handleTwoFaAuthentification(twoFaCode: string) {
			try {
				const response = await AuthService.login2FA(twoFaCode);
				localStorage.setItem('userAuth', JSON.stringify(response.data));
			} catch (error: unknown) {
				throw error;
			}
		},
		async updateUser(username: string, image: string) {
			try {
				if (username)
					this.userData.username = username;
				if (image)
					this.userData.avatar = image;
				console.log(username);
				console.log(image);
				await UsersService.registerUser(this.userData.id, this.userData.username, this.userData.avatar);
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
