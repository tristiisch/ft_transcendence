import axios from 'axios';
import { useUserStore } from '@/stores/userStore';
import { useToast } from 'vue-toastification';

let isPrint = 1

const instance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
});

instance.defaults.headers.common['Content-Type'] = 'application/json';

/*instance.interceptors.response.use(
	function (response) {
		return response;
	},
	function (error) {
		if ([401].includes(error.response.status)) {
			const toast = useToast();
			const userStore = useUserStore();
			alert(
				"Your session has expired. You will be redirected to the login page."
			  );
			//toast.error('Unauthorized: Your session has expired')
			userStore.handleLogout();
			return new Promise(() => {})
		}
		return Promise.reject(error);
	}
);*/

export default instance;
