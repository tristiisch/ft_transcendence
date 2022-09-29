import axios from '@/plugin/axiosInstance';
import socket from '@/plugin/socketInstance';

class AuthService {

	getJwtToken() {
		return sessionStorage.getItem('userAuth');
	}
	
	login(code: string) {
		return axios.post('auth/42/redirect', { code });
	}

	fakeLogin(username: string) {
		return axios.get('auth/fakeLogin/' + username);
	}

	login2FA(otpToken: string) {
		return axios.post('2fa/authenticate', { otpToken });
	}

	getAuth() {
		return axios.get('auth/me');
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
