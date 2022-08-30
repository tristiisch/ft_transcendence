import axios from '@/plugin/axiosInstance';
import type User from '@/types/User';
import type Channel from '@/types/Channel';
import type Match from '@/types/MatchHistory';
import type Discussion from '@/types/Discussion';

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
