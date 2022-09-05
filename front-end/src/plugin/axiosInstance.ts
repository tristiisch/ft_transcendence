import axios from 'axios';
import { useUserStore } from '@/stores/userStore';

const instance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
});

instance.defaults.headers.common['Content-Type'] = 'application/json';

instance.interceptors.response.use(
	function (response) {
		return response;
	},
	function (error) {
		const userStore = useUserStore();
		if ([401].includes(error.response.status) && userStore.isLoggedIn) {
			const userStore = useUserStore();
			userStore.handleLogout();
			return new Promise(() => {})
		}
		return Promise.reject(error);
	}
);

export default instance;
