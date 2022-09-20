import axios from 'axios';
import { useUserStore } from '@/stores/userStore';
import { useToast } from 'vue-toastification';

const instance = axios.create({
	baseURL: 'http://localhost:3000/api',
	//headers: {'Content-Type': 'application/json'}
	// baseURL: import.meta.env.VITE_API_URL // It send all env vars to client \!/
});

instance.interceptors.response.use(
	function (response) {
		return response;
	},
	function (error) {
		const userStore = useUserStore();
		if ([401].includes(error.response.status) && userStore.isLoggedIn) {
			const toast = useToast();
			toast.error('Your session has expired')
			userStore.handleLogout()
		}
		return Promise.reject(error);
	}
);

export default instance;
