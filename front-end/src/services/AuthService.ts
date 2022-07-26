import axios from '@/api/axios';

class AuthService {
	login(code: string, state: string) {
		return axios.post('login-request', { code, state });
	}
}

export default new AuthService();
