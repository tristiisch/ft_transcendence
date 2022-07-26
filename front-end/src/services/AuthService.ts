import axios from '@/api/axios';
import type { AuthUser } from '@/types/User';

class AuthService {
	login(code: string, state: string): Promise<AuthUser> {
		return axios.post('login-request', { code, state }).then((response) => {
			if (response.data.accessToken) {
				localStorage.setItem('user', JSON.stringify(response.data));
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
			}
			return response.data;
		});
	}
}

export default new AuthService();
