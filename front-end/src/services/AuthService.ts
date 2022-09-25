import axios from '@/plugin/axiosInstance';
import socket from '@/plugin/socketInstance';

class AuthService {

	/*isJwtToken() {
		if (localStorage.getItem('userAuth')) return true
		else return false
	}*/
	
	getJwtToken() {
		try {
			return localStorage.getItem('userAuth');
		} catch {
			return null;
		}
	}

	/*private getJwt2FAToken() {
		try {
			const token = localStorage.getItem('userAuth2FA');
			if (token) return token;
			return '';
		}
		catch {
			return null;
		}
	}*/
	
	login(code: string) {
		return axios.post('auth/42/redirect', { code })/*.then((response) => {
			if (response.data.auth.token_jwt) {
				console.log(response)
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.auth.token_jwt}`;
				socket.auth = { token: response.data.auth.token_jwt }
			}
			return response.data;
		})*/
	}

	fakeLogin(username: string) {
		return axios.get('auth/fakeLogin/' + username)/*.then((response) => {
			console.log('get request fakelogin')
			if (response.data.auth.token_jwt) {
				console.log('auth token yes')
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.auth.token_jwt}`;
				socket.auth = { token: response.data.auth.token_jwt }
			}
			return response.data;
		})*/
	}

	login2FA(otpToken: string) {
		/*let config2FA = {
			headers: {
				Authorization: `Bearer ${this.getJwt2FAToken()}`
			}
		}
		console.log('jwt token 2fa', this.getJwt2FAToken());*/
		return axios.post('2fa/authenticate', { otpToken })/*.then((response) => {
			console.log(response.data)
			if (response.data.auth.token_jwt) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.auth.token_jwt}`;
				socket.auth = { token: response.data.auth.token_jwt }
			}
			return response.data;
		});*/
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
