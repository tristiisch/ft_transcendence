import axios from '@/plugin/axiosInstance';
import type User from '@/types/User';
import type Match from '@/types/MatchHistory';

class UserService {

	getUsers() {
		return axios.get('users');
	}

	getMe(id: number) {
		return axios.get(`users/me/${id}`);
	}

	getUser(username: string) {
		return axios.get(`users/${username}`);
	}

	registerUser(id: number, username: string, avatar: string) {
		return axios.patch(`users/register/${id}`, { username, avatar });
	}

	updateUsename(id: number, username: string) {
		return axios.patch(`users/me/${id}/set-username`, { username });
	}

	updateAvatar(id: number, avatar: string) {
		return axios.patch(`users/me/${id}/set-avatar`, { avatar });
	}

	getUserfriends(id: number) {
		console.log(id)
		return axios.get(`friends/names/${id}`);
	}

	sendFriendRequest(id: number, targetUsername: string) {
		return axios.post(`friends/request/add/${id}`, { username: targetUsername });
	}

	acceptFriendRequest(id: number, targetUsername: string) {
		return axios.post(`friends/accept/${id}`, { username: targetUsername });
	}

	refuseFriendRequest(id: number, targetUsername: string) {
		return axios.post(`friends/request/remove/${id}`, { username: targetUsername });
	}

	removeFriend(id: number, targetUsername: string) {
		return axios.post(`friends/remove/${id}`, { username: targetUsername });
	}

	getMatchsHistory(username: string) {
		return axios.post(`matchs/history`, { username: username });
	}

	getCurrentMatchs() {
		return axios.get('matchs/current');
	}

	getNotifications(id: number) {
		return axios.get(`notifications/${id}`);
	}

	getChannels() {
		return axios.get('chat/channels');
	}

}

export default new UserService();
