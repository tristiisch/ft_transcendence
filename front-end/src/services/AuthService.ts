import axios from '@/plugin/axiosInstance';
import type { AxiosResponse } from 'axios';

class AuthService {
	login(code: string) {
		return axios.post('auth/42/redirect', { code }).then((response) => {
			if (response.data.token) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
			}
			return response.data;
		})
	}

	login2FA(otpToken: string) {
		return axios.post('auth/2fa/login', { otpToken }).then((response) => {
			if (response.data.token) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
			}
			return response.data;
		});
	}

	registerUser(jwtToken: string, username: string, avatar: string) {
		return axios.patch(`users/register`, { username, avatar }, { headers: { Authorization: `Bearer ${jwtToken}` } });
	}

	enable2FA() {
		return axios.post('auth/2fa/enable');
	}

	disable2FA() {
		return axios.post('auth/2fa/disable');
	}
}

export default new AuthService();
