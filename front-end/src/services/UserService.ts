import axios from '@/plugin/axiosInstance';
import type User from '@/types/User';
import type Match from '@/types/MatchHistory';

class UserService {

	getMyData(id: string) {
		return axios.get(`users/me/${id}`).then((response) => {
			return response.data;
		});
	}

	setUsername(id: string, username: string) {
		return axios.post(`users/me/${id}/set-username`, { username });
	}

	setAvatar(id: string, avatar: string) {
		return axios.post(`users/me/${id}/set-avatar`, { avatar });
	}

	getUsers() {
		return axios.get('users');
	}

	getUser(username: string) {
		console.log('getUserData')
		return axios.get(`users/${username}`);
	}

	getChannels() {
		return axios.get('channels');
	}

	getUserfriends(username: string) {
		return axios.get(`users/${username}/friends`);
	}

	getCurrentMatchs(username: string) {
		return axios.get(`users/${username}/matchs`);
	}

	sendFriendRequest(username: string, target: string) {
		return axios.post(`users/${username}/friend-request`, { target });
	}

	sendUnfriendRequest(username: string, target: string) {
		return axios.post(`users/${username}/unfriend-request`, { target });
	}

	getMatchsHistory(username: string) {
		return axios.get(`users/${username}/matchsHistory`);
	}

	getNotifications(username: string) {
		return axios.get(`users/${username}/notifications`);
	}

	acceptFriendRequest(id: number, target: string) {
		return axios.post(`accept/:id`, { target });
	}

	declineFriendRequest(id: number, target: string) {
		return axios.post(`remove/:id`, { target });
	}


}

export default new UserService();
