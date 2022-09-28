import { defineStore } from 'pinia';
import { useUserStore } from '@/stores/userStore';
import { useGlobalStore } from '@/stores/globalStore';
import { useToast } from 'vue-toastification';
import socket from '@/plugin/socketInstance';
import UserService from '@/services/UserService';
import type User from '@/types/User';
import type ChatState from '@/types/ChatState';
import type Channel from '@/types/Channel';
import type Discussion from '@/types/Discussion';
import type Message from '@/types/Message';
import ChatStatus from '@/types/ChatStatus';
import MessageType from '@/types/MessageType';
import PartToDisplay from '@/types/ChatPartToDisplay';

export const useChatStore = defineStore('chatStore', {
	state: (): ChatState => ({
		channels: [],
		userDiscussions: [],
		inDiscussion: null,
		userChannels: [],
		inChannel: null,
		cardRightPartToDisplay: PartToDisplay.CHAT,
		cardLeftPartToDisplay: PartToDisplay.DISCUSSIONS,
		cardRightTitle: 'CHAT',
		messages: [],
	}),
	getters: {
		leftPartIsDiscussion: (state) => state.cardLeftPartToDisplay === PartToDisplay.DISCUSSIONS,
		displayChannel: (state) => state.cardRightPartToDisplay === PartToDisplay.CHANNELS,
		displayChannelSettings: (state) => state.cardRightPartToDisplay === PartToDisplay.CHANNEL_SETTINGS,
		displayAddChannel: (state) => state.cardRightPartToDisplay === PartToDisplay.ADD_CHANNEL,
		displayAddDiscussion: (state) => state.cardRightPartToDisplay === PartToDisplay.ADD_DISCUSSION,
		displayPasswordQuery: (state) => state.cardRightPartToDisplay === PartToDisplay.PASSWORD_QUERY,
		displayChat: (state) => state.cardRightPartToDisplay === PartToDisplay.CHAT,
		userIsInChannel: (state) => {
			return (userToCheck: User) => state.inChannel?.users.includes(userToCheck)
		},
		getIndexChannels: (state) => {
			return  (channelId: number) => state.channels.findIndex((channel) => channel.id === channelId);
		},
		getIndexUserChannels: (state) => {
			return  (channelId: number | undefined) => channelId ? state.userChannels.findIndex((userChannel) => userChannel.id === channelId) : -1;
		},
		getIndexUserDiscussions: (state) => {
			return  (userId: number) => state.userDiscussions.findIndex((userDiscussion) => userDiscussion.user.id === userId);
		},
	},
	actions: {
		async fetchAll() {
			try {
				await Promise.all([this.fetchUserChannels(), this.fetchUserDiscussions()])
				//await Promise.all([this.fetchUserChats(null, null)])
			} catch (error: any) {
				throw error;
			}
		},
		/**
		 * @Deprecated
		 */
		async fetchUserChats(func: { (discu: Discussion[], channel: Channel[]): any } | null, err: { (error: any): any } | null) {
			socket.emit('chatFindAll', (body: any[]) => {
				this.userDiscussions = body[0];
				this.userChannels = body[1];
				if (func)
					func(this.userDiscussions, this.userChannels);
			});
			// if (err)
			// 	err(null);
		},
		async fetchUserChannels() {
			if (!this.userChannels.length)
			{
				try {
					const response = await UserService.getUserChannels();
					this.userChannels = response.data;
				} catch (error: any) {
					throw error;
				}
			}
		},
		async fetchUserDiscussions() {
			if (!this.userDiscussions.length)
			{
				try {
					const response = await UserService.getUserDiscussions();
					this.userDiscussions = response.data;
				} catch (error: any) {
					throw error;
				}
			}
		},
		async fetchChannels() {
			try {
				const response = await UserService.getChannels();
				this.channels = response.data;
			} catch (error: any) {
				throw error;
			}
			this.setCardRightTitle(this.cardRightPartToDisplay);
		},
		setLeftPartToDisplay(clickedOn: string) {
			if (this.cardLeftPartToDisplay === PartToDisplay.DISCUSSIONS && clickedOn !== 'discussion') this.cardLeftPartToDisplay = PartToDisplay.CHANNELS;
			else if (this.cardLeftPartToDisplay === PartToDisplay.CHANNELS && clickedOn !== 'channels') this.cardLeftPartToDisplay = PartToDisplay.DISCUSSIONS;
		},
		setCardRightTitle(displayPart: PartToDisplay) {
			if (displayPart === PartToDisplay.CHAT) this.cardRightTitle = 'CHAT';
			else if (displayPart === PartToDisplay.ADD_DISCUSSION) this.cardRightTitle = 'DISCUSSION';
			else if (displayPart === PartToDisplay.ADD_CHANNEL) this.cardRightTitle = 'CHANNEL';
			else if (displayPart === PartToDisplay.CHANNEL_SETTINGS) this.cardRightTitle = 'SETTINGS';
		},
		setRightPartToDisplay(name: PartToDisplay | null) {
			if (name) this.cardRightPartToDisplay = name;
			else {
				if (this.cardLeftPartToDisplay === PartToDisplay.DISCUSSIONS) this.cardRightPartToDisplay = PartToDisplay.ADD_DISCUSSION;
				else if (this.cardLeftPartToDisplay === PartToDisplay.CHANNELS) this.cardRightPartToDisplay = PartToDisplay.ADD_CHANNEL;
			}
			this.setCardRightTitle(this.cardRightPartToDisplay);
		},
		loadChannel(channel: Channel) {
			if (this.inDiscussion) this.inDiscussion = null;
			this.inChannel = channel;
			this.setRightPartToDisplay(PartToDisplay.CHAT);
			if (this.cardLeftPartToDisplay === PartToDisplay.DISCUSSIONS)
				this.cardLeftPartToDisplay = PartToDisplay.CHANNELS;
			this.shiftPositionUserChannel(channel);
		},
		loadDiscussion(discussion: Discussion) {
			if (this.inChannel) this.inChannel = null;
			this.inDiscussion = discussion;
			this.setRightPartToDisplay(PartToDisplay.CHAT);
			this.shiftPositionUserDiscussion(discussion);
		},
		addNewChannel(user: User, channel: Channel) {
			this.userChannels.push(channel);
			const toast = useToast();
			toast.info('you have been added in ' + channel.name + " by " + user.username);
		},
		addNewDiscussion(discussion: Discussion) {
			this.userDiscussions.push(discussion);
			const toast = useToast();
			toast.info(discussion.user.username + ' started a new discussion with you.');
		},
		createNewDiscussion(newDiscussion: Discussion, load: boolean) {
			const index = this.userDiscussions.findIndex(discussion => discussion.user.id === newDiscussion.user.id)
			if (index < 0) {
				this.userDiscussions.length ? this.userDiscussions.unshift(newDiscussion) : this.userDiscussions.push(newDiscussion)
				if (load === true)
					this.loadDiscussion(this.userDiscussions[0]);
			}
			else
				this.loadDiscussion(this.userDiscussions[index]);
		},
		addUsersToChannel(channelUpdated: Channel, inviter?: User) { 
			if (inviter)
				this.addNewChannel(inviter, channelUpdated);
			else
				this.updateChannel(channelUpdated);	
		},
		createNewChannel(newChannel: Channel, selection: User[], password?: string) {
			const userStore = useUserStore();
			password = (password === '' ? undefined : password);
			socket.emit('chatChannelCreate', userStore.userData, {
				name: newChannel.name,
				avatar_64: newChannel.avatar,
				hasPassword: newChannel.hasPassword,
				type: newChannel.type,
				users_ids: newChannel.users.map((user: User) => user.id)
			}, password, (channelCreated: Channel) => {
				console.log('channelCreated', channelCreated)
				this.userChannels.length ? this.userChannels.unshift(channelCreated) : this.userChannels.push(channelCreated);
				this.loadChannel(this.userChannels[0]);
			});
		},
		joinNewChannel(channel : Channel, password?: string) {
			const userStore = useUserStore();
			socket.emit('chatChannelJoin', channel, userStore.userData, password, (channelUpdated: Channel) => {
				this.userChannels.length ? this.userChannels.unshift(channelUpdated) : this.userChannels.push(channelUpdated);
				this.loadChannel(this.userChannels[0]);
			});
		},
		inviteUserToPrivateChannel(channel: Channel, users: User[]) {
			const userStore = useUserStore();
			socket.emit('chatChannelInvitation', channel, users, userStore.userData, (body: any[]) => {
				const channelUpdated: Channel = body[0];
				this.updateChannel(channelUpdated);
			});
		},
		deleteUserDiscussion(index: number) {
			const userStore = useUserStore();
			if (index >= 0) {
				this.userDiscussions.splice(index, 1);
			}
		},
		deleteUserChannel(channel: Channel) {
			const indexUserChannel = this.getIndexUserChannels(channel.id)
			if (indexUserChannel >= 0) {
				this.userChannels.splice(indexUserChannel, 1);
				this.resetInChannel(channel)
			}
		},
		leaveChannel(channel: Channel, user?: User) {
			const userStore = useUserStore();
			if (user && (userStore.userData.id === user.id)) {
				socket.emit('chatChannelLeave', channel, userStore.userData, (body: any[]) => {
					const ok: boolean = body[0];
					if (ok) {
						this.deleteUserChannel(channel);
						if (this.inChannel && this.inChannel.id === channel.id)
							this.resetInChannel(this.inChannel);
					}
				});
			}
			else
				this.updateChannel(channel);
		},
		updateChannelNamePassword(channel: Channel, newNamePassword?: { name: string, password: string | undefined | null, userWhoChangeName: User }, oldId?: number) {
			const userStore = useUserStore();
			if (newNamePassword && newNamePassword.userWhoChangeName.id === userStore.userData.id) {
				if (this.inChannel && ((newNamePassword.name != '' && newNamePassword.name !== this.inChannel.name) || (this.inChannel.hasPassword === false && newNamePassword.password !== '') || (newNamePassword.password === null))) {
					socket.emit('chatChannelNamePassword', channel, newNamePassword, (body: any[]) => {
						const channelUpdated: Channel = body[0];
						this.updateChannel(channelUpdated, channel.id);
					});
				}
			}
			else
				this.updateChannel(channel, oldId)
		},
		updateBanList(channel: Channel, newBanned: {list: User[], userWhoSelect: User }) {
			const userStore = useUserStore();
			if (newBanned.userWhoSelect.id ===  userStore.userData.id) {
				socket.emit('chatChannelBan', channel, newBanned, (body: any[]) => {
					const channelUpdated: Channel = body[0];
				 	this.updateChannel(channelUpdated);
				});
			}
			else {
				const user = newBanned.list.find(user => user. id === userStore.userData.id);
				if (user && channel.id) {
					this.deleteUserChannel(channel);
					this.resetInChannel(channel);
					const toast = useToast();
					toast.info('you have been banned from channel ' + channel.name + " by " + newBanned.userWhoSelect.username);
				}
				else
					this.updateChannel(channel);
			}
		},
		updateMuteList(channel: Channel, newMuted?: {list: User[], userWhoSelect: User }) {
			const userStore = useUserStore();
			if (newMuted && newMuted.userWhoSelect.id === userStore.userData.id) {
				socket.emit('chatChannelMute', channel, newMuted, (body: any[]) => {
					const channelUpdated: Channel = body[0];
				 	this.updateChannel(channelUpdated);
				});
			}
			else
				this.updateChannel(channel);
		},
		updateAdminList(channel: Channel, newAdmin?: {list: User[], userWhoSelect: User }) {
			const userStore = useUserStore();
			if (newAdmin && newAdmin.userWhoSelect.id === userStore.userData.id) {
				socket.emit('chatChannelAdmin', channel, newAdmin, (body: any[]) => {
					const channelUpdated: Channel = body[0];
				 	this.updateChannel( channelUpdated);
				});
			} 
			else 
				this.updateChannel(channel);
		},
		KickUsers(channel: Channel, newKicked: {list: User[], userWhoSelect: User }) {
			const userStore = useUserStore();
			if (newKicked.userWhoSelect.id === userStore.userData.id) {
				socket.emit('chatChannelKick', channel, newKicked, (body: any[]) => {
					const channelUpdated: Channel = body[0];
				 	this.updateChannel( channelUpdated);
				})
			}
			else {
				const user = newKicked.list.find(user => user.id === userStore.userData.id);
				if (user && channel.id) {
					this.deleteUserChannel(channel);
					this.resetInChannel(channel);
					const toast = useToast();
					toast.info('you have been Kicked from channel ' + channel.name + " by " + newKicked.userWhoSelect.username);
				}
				else
					this.updateChannel(channel)
			}
		},
		createMessage(newMessage: string, type: MessageType) {
			const userStore = useUserStore();
			const now = new Date().toLocaleString();
			const messageDTO: Message = {
				date: now,
				message: newMessage,
				idSender: type === MessageType.AUTOMATIC_MESSAGE ? -1 : userStore.userData.id,
				avatarSender: userStore.userData.avatar,
				usernameSender: userStore.userData.username,
				read: false,
				type: type
			};
			return messageDTO;
		},
		sendMessageDiscussion(newMessage: string, type: MessageType, discussion: Discussion) {
			if (newMessage != '') {
				const messageDTO = this.createMessage(newMessage, type)
				messageDTO['idChat'] = discussion.id;
				const chat: Discussion = discussion;
				socket.emit('chatDiscussionMessage', discussion.user.id, messageDTO, (body: any[]) => {
					const discu: Discussion = body[0];
					const msg: Message = body[1];
					console.log('chatDiscussionMessage', msg, 'Discussion', discu);
					chat.messages.push(msg)
				});
			}
		},
		sendMessageChannel(newMessage: string, type: MessageType, channel: Channel) {
			if (newMessage != '') {
				const messageDTO = this.createMessage(newMessage, type)
				messageDTO['idChat'] = channel.id;
				const chat: Channel = channel;
				socket.emit('chatChannelMessage', { id: channel.id, type: channel.type }, messageDTO, (body: any[]) => {
					const channel: Channel = body[0];
					const msg: Message = body[1];
					console.log('channel Message', msg);
					if (!msg) {
						console.log('ERROR chatChannelMessage', channel, 'messageDTO', messageDTO);
					}
					chat.messages.push(msg)
				});
			}
		},
		addDiscussionMessage(discussion: Discussion, data: Message, user: User) {
			const globalStore = useGlobalStore();
			const index = this.getIndexUserDiscussions(data.idSender);
			if (index < 0)  {
				if (user) {
				const newDiscussion: Discussion = {
					type: ChatStatus.DISCUSSION,
					user: user,
					messages: [data]
					};
					this.addNewDiscussion(newDiscussion);
				}
			}
			else
				this.userDiscussions[index].messages.push(data);
		},
		addChannelMessage(channel: Channel, data: Message) {
			if (this.inChannel && this.inChannel.id === channel.id)
				this.inChannel.messages.push(data)
			else {
				const index = this.getIndexUserChannels(channel.id);
				if (index >= 0) this.userChannels[index].messages.push(data);
			}
		},
		updateChannel(channelUpdated: Channel, oldId?:number) {
			let index;
			if (oldId)
				index = this.getIndexUserChannels(oldId);
			else
				index = this.getIndexUserChannels(channelUpdated.id);
			if (index >= 0) {
				this.userChannels[index] = channelUpdated;
				if (this.inChannel && ((this.inChannel.id === channelUpdated.id) || (this.inChannel.id === oldId)))
					this.inChannel = this.userChannels[index]
			}
		},
		resetInChannel(channel: Channel) {
			if (this.inChannel && this.inChannel.id === channel.id) {
				this.inChannel = null;
				this.setRightPartToDisplay(PartToDisplay.CHAT);
			}
		},
		markMessageReaded(message: Message) {
			if (message.read === false) {
				message.read = true;
				let msgId;
				if (this.inChannel)
					msgId = this.inChannel.messages[this.inChannel.messages.length - 1].idMessage
				else if (this.inDiscussion)
					msgId = this.inDiscussion.messages[this.inDiscussion.messages.length - 1].idMessage
				if (msgId === message.idMessage) {
					console.log(message.idMessage)
					console.log(message.idChat)
					socket.emit('chatMsgReaded', message.idMessage, message.idChat);
				}
			}
		},
		nbUnreadMessageInDiscussion(discussion: Discussion) {
			let nbUnreadMessage = 0;
			for (const message of discussion.messages)
				if (message.read === false)
					nbUnreadMessage ++;
			return nbUnreadMessage
		},
		nbUnreadMessageInChannel(channel: Channel) {
			let nbUnreadMessage = 0;
			for (const message of channel.messages)
				if (message.read === false)
					nbUnreadMessage ++;
			return nbUnreadMessage
		},
		shiftPositionUserChannel( channel: Channel) {
			const fromIndex = this.getIndexUserChannels(channel.id)
			if (fromIndex > 0) {
				const element = this.userChannels.splice(fromIndex, 1)[0];
				this.userChannels.unshift(element);
			}
		},
		shiftPositionUserDiscussion(discussion: Discussion) {
			const fromIndex = this.getIndexUserDiscussions(discussion.user.id)
			if (fromIndex > 0) {
				const element = this.userDiscussions.splice(fromIndex, 1)[0];
				this.userDiscussions.unshift(element);
			}
		},
		isNewDiscussion(userId: number) {
			for (const discussion of this.userDiscussions) {
				if (discussion.user.id === userId) {
					this.loadDiscussion(discussion);
					this.setLeftPartToDisplay('discussion');
					return 1;
				}
			}
			return 0;
		}
	},
});
