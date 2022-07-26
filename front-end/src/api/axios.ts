import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const instance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
});

instance.interceptors.response.use(
	response => response,
	error => {
		const authStore = useAuthStore();
		if (error.response.status === 401) {
			authStore.handlelogout()
			console.log(error);
		}
		return Promise.reject(error);
	}
);

instance.interceptors.response.use(
	response => response,
	error => {
		const authStore = useAuthStore();
		if (error.response.status === 444) {
			authStore.handlelogout()
			console.log(error);
		}
		return Promise.reject(error);
	}
);

instance.interceptors.response.use(
	response => response,
	error => {
		if (error.response.status === 445) {
			console.log(error);
		}
		return Promise.reject(error);
	}
);

export default instance;
