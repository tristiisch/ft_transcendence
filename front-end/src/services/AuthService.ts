import axios from '@/plugin/axiosInstance';
import type { AxiosResponse } from 'axios';

class AuthService {
	login(code: string) {
		return axios.post('auth/42/redirect', { code }).then((response) => {
			if (response.data.auth.token) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.auth.token}`;
			}
			return response.data;
		})
	}

	login2FA(otpToken: string) {
		return axios.post('auth/2fa/login', { otpToken }).then((response) => {
			console.log(response.data)
			if (response.data.auth.token) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.auth.token}`;
			}
			return response.data;
		});
	}

	registerUser(username: string, avatar: string) {
		return axios.patch(`users/register`, { username, avatar });
	}

	enable2FA() {
		return axios.post('2fa/enable');
	}

	disable2FA() {
		return axios.get('2fa/disable');
	}

	getQrCode2FA() {
		return axios.post('2fa/generate');
	}
}

export default new AuthService();
