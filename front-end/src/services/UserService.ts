import axios from '@/api/axios';

class UserService {
	getUsers() {
		return axios.get('users');
	}

	getUserInfo(username: string) {
		return axios.get('user/' + username);
	}

	getUserfriends(username: string) {
		return axios.get('user/friends/' + username);
	}

	sendFriendRequest(fromUser: string, friendUser: string) {
		return axios.post('user/friend-request', { fromUser, friendUser });
	}

	sendUnfriendRequest(fromUser: string, friendUser: string) {
		return axios.post('user/unfriend-request', { fromUser, friendUser });
	}
}

export default new UserService();
