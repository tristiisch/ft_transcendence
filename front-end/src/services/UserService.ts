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
		return axios.get(`friends/${id}`);
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

	getUserDiscussions() {
		return axios.get(`chat/user-discussions`);
	}

	getUserChannels() {
		return axios.get(`chat/user-channels`);
	}

	//Use socket for the fetch below
	addDiscussion(newDiscussion: Discussion) {
		return axios.post(`chat/add-discussion`, { discussion: newDiscussion });
	}

	addChannel(newChannel: Channel) {
		return axios.post(`chat/add-channel`, { channel: newChannel });
	}

	deleteChannel(targetId: number) {
		return axios.post(`chat/delete-channel`, { id: targetId });
	}

	deleteDiscussion(targetId: number) {
		return axios.post(`chat/delete-discussion`, { id: targetId });
	}

	leaveChannel(targetId: number) {
		return axios.post(`chat/leave-channel`, { id: targetId });
	}

	channelAddAdmins(newAdminList: number[]) {
		return axios.post(`chat/add-admins`, { users: newAdminList });
	}

	channelBanMembers(newBanList: number[]) {
		return axios.post(`chat/ban-users`, { users: newBanList });
	}

	channelMuteMembers(newMuteList: number[]) {
		return axios.post(`chat/mute-users`, { users: newMuteList });
	}

	channelRemoveMembers(newBanList: number[]) {
		return axios.post(`chat/kick-users`, { users: newBanList });
	}
}

export default new UserService();
