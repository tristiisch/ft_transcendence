import { defineStore } from 'pinia';

interface AuthState {
	isAuthenticated: boolean;
}

export const useAuthStore = defineStore('authStore', {
	state: (): AuthState => ({
		isAuthenticated: true,
	}),
	getters: {
		getIsAuthenticated: (state) => state.isAuthenticated,
	},
	actions: {},
});
