import axios from 'axios';
import { useUserStore } from '@/stores/userStore';

const authString = localStorage.getItem('userAuth');

if (authString) {
	const token = JSON.parse(authString).accessToken;
	axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const instance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
});

instance.interceptors.response.use(
	response => response,
	error => {
		const userStore = useUserStore();
		if (error.response.status === 401) {
			userStore.handlelogout()
			console.log(error);
		}
		return Promise.reject(error);
	}
);

instance.interceptors.response.use(
	response => response,
	error => {
		const userStore = useUserStore();
		if (error.response.status === 444) {
			userStore.handlelogout()
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
