import axios from '@/plugin/axiosInstance';

class AuthService {
	login(code: string) {
		return axios.post('auth/login', { code }).then((response) => {
			if (response.data.auth.token) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.auth.token}`;
			}
			return response.data;
		});
	}

	login2FA(otpToken: string) {
		return axios.post('auth/2fa/login', { otpToken }).then((response) => {
			if (response.data.auth.token) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.auth.token}`;
			}
			return response.data;
		});
	}

	enable2FA() {
		return axios.get('auth/2fa/enable');
	}

	disable2FA() {
		return axios.get('auth/2fa/disable');
	}

	getQrCode2FA() {
		return axios.get('auth/2fa/qr-code');
	}
}

export default new AuthService();
