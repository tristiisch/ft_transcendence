class TokenService {
		isLocalToken() {
			if (localStorage.getItem('userToken')) return true
			return false
		}
		getLocalToken() {
			try {
				const token = localStorage.getItem('userToken');
				if (token) return JSON.parse(token)
			}
			catch {
				return null
			}
		}
		setLocalToken(token: string) {
			localStorage.setItem('userToken', JSON.stringify(token));
		}
		removeLocalToken() {
			localStorage.removeItem('userToken');
		}
	}
  export default new TokenService();
