import axios from '@/plugin/axiosInstance';
import type User from '@/types/User';
import type Match from '@/types/MatchHistory';

class UserService {

	getUsers() {
		return axios.get('users');
	}

	getUser(id: number) {
		return axios.get(`users/${id}`);
	}

	getMe() {
		return axios.get('users/me');
	}

	registerUser(id: number, username: string, avatar_64: string) {
		return axios.patch(`users/register`, { username, avatar_64 });
	}

	updateUsename(username: string) {
		return axios.patch(`users/set-username`, { username });
	}

	updateAvatar(avatar_64: string) {
		return axios.patch(`users/set-avatar`, { avatar_64 });
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

	getLeaderboard() {
		return axios.get(`stats/leaderboard-with-friends`);
	}

	/**
	 * @param id Should be defined only if you need the history of other user
	 */
	getMatchsHistory(id: number) {
		return axios.post(`matchs/history`, { id: id });
	}

	getCurrentMatchs() {
		return axios.get('matchs/current');
	}

	getNotifications() {
		return axios.get(`notification`);
	}

	getStats(id: number) {
		return axios.post('stats', { id: id });
	}

	getChannels() {
		return axios.get('chat/channels');
	}

}

export default new UserService();
