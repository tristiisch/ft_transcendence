import axios from '@/plugin/axiosInstance';
import type { AxiosResponse } from 'axios';

class AuthService {
	login(code: string, state: string) {
		return axios.post('auth/42/redirect', { code, state }).then((response) => {
			if (response.data.accessToken) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
			}
			console.log(response)
			return response.data;
		}).catch((error) => {
			console.log(error.response.data.message)
		});
	}

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
