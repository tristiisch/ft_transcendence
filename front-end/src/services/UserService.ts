import axios from '@/plugin/axiosInstance';
import type User from '@/types/User';
import type Channel from '@/types/Channel';
import type Match from '@/types/MatchHistory';
import type Discussion from '@/types/Discussion';

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

	registerUser(username: string, avatar_64: string) {
		return axios.patch(`users/register`, { username, avatar_64 });
	}

	updateUsename(username: string) {
		return axios.patch(`users/set-username`, { username });
	}

	updateAvatar(avatar_64: string) {
		return axios.patch(`users/set-avatar`, { avatar_64 });
	}

	getUserfriends(id: number) {
		return axios.get(`friends/names/${id}`);
	}

	sendFriendRequest(targetId: number) {
		return axios.post(`friends/request/add`, { id: targetId });
	}

	acceptFriendRequest(targetId: number) {
		return axios.post(`friends/accept`, { id: targetId });
	}

	refuseFriendRequest(targetId: number) {
		return axios.post(`friends/request/remove`, { id: targetId });
	}

	removeFriend(targetId: number) {
		return axios.post(`friends/remove`, { id: targetId });
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

	notificationAction(notifId: number, accept: boolean) {
		return axios.post(`notification/action`, { id: notifId, accept: accept });
	}

	getStats(id: number) {
		return axios.post('stats', { id: id });
	}

	getChannels() {
		return axios.get('chat/channels');
	}

	getDiscussions(id: number) {
		return axios.get(`chat/discussionsHistoric/${id}`);
	}

	addDiscussion(id: number, newDiscussion: Discussion) {
		return axios.post(`chat/addDiscussion/${id}`, { discussion: newDiscussion })
	}

	addChannel(id: number, newChannel: Channel) {
		return axios.post(`chat/addChannel/${id}`, { channel: newChannel })
	}

	deleteChannel(id: number, targetId: number) {
		return axios.post(`chat/leaveChannel/${id}`, { id: targetId })
	}

	deleteDiscussionl(id: number, targetId: number) {
		return axios.post(`chat/leaveChannel/${id}`, { id: targetId })
	}

	leaveChannel(id: number, targetId: number) {
		return axios.post(`chat/leaveChannel/${id}`, { id: targetId })
	}

	channelAddAdmins(id: number, newAdminList: User[]) {
		return axios.post(`chat/channelAddAdmins/${id}`, { adminList: newAdminList })
	}

	channelBanMembers(id: number, newBanList: User[]) {
		return axios.post(`chat/channelBanPlayers/${id}`, { banList: newBanList})
	}

	channelMuteMembers(id: number, newMuteList: User[]) {
		return axios.post(`chat/channelMutePlayers/${id}`, { muteList: newMuteList })
	}

	channelRemoveMembers(id: number, newBanList: User[]) {
		return axios.post(`chat/channelBanPlayers/${id}`, { banList: newBanList})
	}
}

export default new UserService();
