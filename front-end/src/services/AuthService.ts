import axios from '@/plugin/axiosInstance';
import type { AxiosResponse } from 'axios';

class AuthService {
	login(code: string, state: string) {
		return axios.post('auth/42/redirect', { code, state }).then((response) => {
			if (response.data.accessToken) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
			}
			return response.data;
		});
	}

	/*login() {
		return axios.get('auth/42/login').then((response: AxiosResponse<any, any>) => {

			//console.log("DEBUG", response.headers['Location'], response.headers);
			/*if (response.data.accessToken) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
			}
			return response.data;
		})
		.catch((error) => {
			if (error.response && error.response.status === 302)
				window.location.href = "logon";
		})
	}*/

	login2FA(otpToken: string) {
		return axios.post('auth/2fa/login', { otpToken }).then((response) => {
			if (response.data.accessToken) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
			}
			return response.data;
		});
	}

	enable2FA() {
		return axios.post('auth/2fa/enable');
	}

	disable2FA() {
		return axios.post('auth/2fa/disable');
	}
}

export default new AuthService();
