import axios from 'axios';
import { useUserStore } from '@/stores/userStore';

const instance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
});

instance.interceptors.response.use(
	response => response,
	error => {
		const userStore = useUserStore();
		if (error.response.status === 401) {
			userStore.handleLogout()
			console.log('Your session has expired');
		}
		return Promise.reject(error);
	}
);

export default instance;
