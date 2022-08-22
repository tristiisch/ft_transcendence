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

	getUser(id: number) {
		return axios.get(`users/${id}`);
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

	sendFriendRequest(id: number, targetId: number) {
		return axios.post(`friends/request/add/${id}`, { id: targetId });
	}

	acceptFriendRequest(id: number, targetId: number) {
		return axios.post(`friends/accept/${id}`, { id: targetId });
	}

	refuseFriendRequest(id: number, targetId: number) {
		return axios.post(`friends/request/remove/${id}`, { id: targetId });
	}

	removeFriend(id: number, targetId: number) {
		return axios.post(`friends/remove/${id}`, { id: targetId });
	}

	getMatchsHistory(id: number) {
		return axios.post(`matchs/history/${id}`);
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
