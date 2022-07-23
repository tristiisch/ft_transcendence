import { defineStore } from 'pinia';

interface AuthState {
	isAuthenticated: boolean;
}

export const useAuthStore = defineStore('authStore', {
	state: (): AuthState => ({
		isAuthenticated: false,
	}),
	getters: {
		getIsAuthenticated: (state) => state.isAuthenticated,
	},
	actions: {},
});
