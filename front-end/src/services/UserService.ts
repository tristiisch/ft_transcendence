import axios from '@/api/axios';
import type User from '@/types/User';
import type Match from '@/types/Match';

class UserService {

	setUsername(id: string, username: string) {
		return axios.post('user/' + id, { username });
	}

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

	getCurrentMatchs() {
		return axios.get(`matchs`);
	}
}

export default new UserService();
