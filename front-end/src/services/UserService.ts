import axios from '@/plugin/axiosInstance';
import type User from '@/types/User';
import type Match from '@/types/MatchHistory';

class UserService {

	getUsers() {
		return axios.get('users');
	}

	getUser(username: string) {
		console.log('getUserData')
		return axios.get(`users/${username}`);
	}

	getUserfriends(id: number) {
		console.log(id)
		return axios.get(`friends/names/${id}`);
	}

	getCurrentMatchs() {
		return axios.get('matchs');
	}

	sendFriendRequest(id: number, targetUsername: string) {
		return axios.post(`friends/request/add/${id}`, { username: targetUsername });
	}

	AcceptFriendRequest(id: number, targetId: number) {
		return axios.post(`friends/accept/${id}`, { id: targetId });
	}

	RefuseFriendRequest(id: number, targetId: number) {
		return axios.post(`friends/request/remove/${id}`, { id: targetId });
	}

	removeFriend(id: number, targetUsername: string) {
		return axios.post(`friends/remove/${id}`, { username: targetUsername });
	}

	getMatchsHistory(username: string) {
		return axios.post(`matchs/history`, { username: username });
	}
}

export default new UserService();
