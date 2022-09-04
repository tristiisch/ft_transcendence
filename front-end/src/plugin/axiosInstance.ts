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
		if ([401, 403].includes(error.response.status)) {
			const userStore = useUserStore();
			userStore.handleLogout();
		}
		return Promise.reject(error);
	}
);

export default instance;
