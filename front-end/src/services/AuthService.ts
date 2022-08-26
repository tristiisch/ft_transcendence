import axios from '@/plugin/axiosInstance';
import type { AxiosResponse } from 'axios';

class AuthService {
	login(code: string) {
		return axios.post('auth/42/redirect', { code }).then((response) => {
			if (response.data.auth.token_jwt) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.auth.token_jwt}`;
			}
			return response.data;
		})
	}

	login2FA(otpToken: string) {
		return axios.post('2fa/authenticate', { otpToken }).then((response) => {
			console.log(response.data)
			if (response.data.auth.token_jwt) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.auth.token_jwt}`;
			}
			return response.data;
		});
	}

	registerUser(username: string, avatar: string) {
		return axios.patch(`users/register`, { username, avatar });
	}

	enable2FA(twoFacode: number) {
		return axios.post('2fa/enable', { twoFacode });
	}

	disable2FA() {
		return axios.get('2fa/disable');
	}

	getQrCode2FA() {
		return axios.get('2fa/generate');
	}
}

export default new AuthService();
