import axios from 'axios';

const instance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: false,
	headers: {
		Accept: 'application/json',
		'Content-type': 'application/json',
	},
});

/*instance.interceptors.response.use(
	function (response) {
		return response;
	},
	function (error) {
		if (error && error.response.status === 401) {
			//globalStore.disconnectUser({ message: 'Your session has expired' })
			console.log(error);
		}
		return Promise.reject(error);
	}
);

instance.interceptors.response.use(
	function (response) {
		return response;
	},
	function (error) {
		if (error && error.response.status === 444) {
			//globalStore.disconnectUser({ message: 'Your session has expired' })
			//store.commit('disconnectUser', { message: "You are blocked from the website" });
			console.log(error);
		}
		return Promise.reject(error);
	}
);

instance.interceptors.response.use(
	function (response) {
		return response;
	},
	function (error) {
		if (error && error.response.status === 445) {
			//store.commit('notAdminRedirect');
			console.log(error);
		}
		return Promise.reject(error);
	}
);*/

export default instance;
