import axios from 'axios';
import { useUserStore } from '@/stores/userStore';
import { useToast } from 'vue-toastification';
import AuthService from '@/services/AuthService';

const instance = axios.create({
	//baseURL: 'http://localhost:3000/api',
	//headers: {'Content-Type': 'application/json'}
	baseURL: import.meta.env.VITE_API_URL // It send all env vars to client \!/
});

instance.interceptors.request.use(function (config) {
	const userStore = useUserStore();
	console.log(userStore.isLoggedIn)
	if (!userStore.isLoggedIn) config.headers!.Authorization = `Bearer ${userStore.userAuth.token_jwt}`
	else config.headers!.Authorization = `Bearer ${AuthService.getJwtToken()}`
	//config.headers!.Authorization =  token ? `Bearer ${token}` : '';
		return config;
	}, function (error) {
		return Promise.reject(error);
	}
);
  
instance.interceptors.response.use(function (response) {
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
