import axios from '@/api/axios';

class AuthService {
	login(code: string, state: string) {
		return axios.post('auth/login-request', { code, state }).then((response) => {
			if (response.data.accessToken) {
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
			}
			return response.data;
		});
	}
}

export default new AuthService();
