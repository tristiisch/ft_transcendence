import axios from '@/api/axios';
import type User from '@/types/User';
import type Match from '@/types/Match';

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

	getCurrentMatchs() {
		return axios.get(`matchs`);
	}

	getMatchsHistory() {
		return axios.get('user/matchsHistory');
	}
}

export default new UserService();
