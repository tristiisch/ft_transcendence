import axios from '@/api/axios';

interface AuthUser {
	id: string;
	token: string;
	username: string;
	avatar: string;
}
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

	/*async login(code: string, state: string): Promise<AuthUser> {
		try {
			const response = await axios.post('login-request', { code, state });
			if (response.data.accessToken) {
				localStorage.setItem('user', JSON.stringify(response.data));
			}
			return response.data;
		} catch (error) {
			console.log('error in service');
			console.log(error);
			throw error;
		}
	}*/
}

export default new AuthService();
