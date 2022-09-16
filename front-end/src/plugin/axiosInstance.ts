import axios from 'axios';
import { useUserStore } from '@/stores/userStore';
import { useToast } from 'vue-toastification';

const instance = axios.create({
	baseURL: 'http://localhost:3000/api'
	// baseURL: import.meta.env.VITE_API_URL // It send all env vars to client \!/
});

instance.defaults.headers.common['Content-Type'] = 'application/json';

let isTreat = 0

instance.interceptors.response.use(
	function (response) {
		return response;
	},
	function (error) {
		if ([401].includes(error.response.status) && !isTreat) {
			isTreat = 1
			const toast = useToast();
			const userStore = useUserStore();
			toast.error('Your session has expired')
			userStore.resetAll()
		}
		return Promise.reject(error);
	}
);

export default instance;
