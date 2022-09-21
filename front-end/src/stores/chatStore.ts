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
				// await Promise.all([this.fetchUserChannels(), this.fetchUserDiscussions()])
				await Promise.all([this.fetchUserChats(null, null)])
			} catch (error: any) {
				throw error;
			}
		},
		async fetchUserChats(func: { (discu: Discussion[], channel: Channel[]): any } | null, err: { (error: any): any } | null) {
			if (!this.userDiscussions.length || !this.userChannels.length)
			{
				socket.emit('chatFindAll', (body: any[]) => {
					this.userDiscussions = body[0];
					this.userChannels = body[1];
					if (func)
						func(this.userDiscussions, this.userChannels);
				});
				// if (err)
				// 	err(null);
			}
		},
		/**
		 * @Deprecated
		 */
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
		/**
		 * @Deprecated
		 */
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
		createNewChannel(newChannel: Channel, selection: User[]) {
			const userStore = useUserStore();
			socket.emit('chatChannelCreate', userStore.userData, {
				name: newChannel.name,
				avatar_64: newChannel.avatar,
				hasPassword: newChannel.hasPassword,
				password: newChannel.password,
				type: newChannel.type,
				users_ids: newChannel.users.map((user: User) => user.id)
			}, (channelCreated: Channel) => {
				console.log('channelCreated', channelCreated)
				const type = this.channelTypeToString(channelCreated);
				this.userChannels.length ? this.userChannels.unshift(channelCreated) : this.userChannels.push(channelCreated);
				this.inChannel = this.userChannels[0];
				this.addAutomaticMessageSelection(this.inChannel, {unlisted:[userStore.userData], listed: selection}, ' is creator of this ' + type + ' channel'
					, 'have been added to ' + this.inChannel.name + ' by ' + userStore.userData.username);
				this.loadChannel(this.inChannel);
			});
		},
		joinNewChannel(channel : Channel) {
			const userStore = useUserStore();
			socket.emit('chatChannelJoin', channel, userStore.userData, (channelUpdated: Channel) => {
				this.userChannels.length ? this.userChannels.unshift(channelUpdated) : this.userChannels.push(channelUpdated);
				this.inChannel = this.userChannels[0];
				this.addAutomaticMessage(channel, userStore.userData, 'just joined the channel')
				this.setRightPartToDisplay(PartToDisplay.CHAT);
			});
		},
		inviteUserToPrivateChannel(channel: Channel, users: User[]) {
			const userStore = useUserStore();
			socket.emit('chatChannelInvitation', channel, users, userStore.userData, (body: any[]) => {
				const channelUpdated: Channel = body[0];
				if (this.inChannel)
					this.addAutomaticMessageSelection(this.inChannel, { unlisted: [], listed: users}, '', ' have been invited into the channel')
				this.updateChannel(channelUpdated);
			});
		},
		deleteUserDiscussion(index: number) {
			const userStore = useUserStore();
			if (index >= 0) {
				this.userDiscussions.splice(index, 1);
			}
		},
		deleteUserChannel(indexUserChannel: number) {
			if (indexUserChannel >= 0) this.userChannels.splice(indexUserChannel, 1);
		},
		leaveChannel(channel: Channel, user?: User) {
			const userStore = useUserStore();
			if (user && (userStore.userData.id === user.id)) {
				socket.emit('chatChannelLeave', channel, userStore.userData, (body: any[]) => {
					const ok: boolean = body[0];
					if (ok) {
						this.addAutomaticMessage(channel, userStore.userData, 'just leaved the channel')
						this.deleteUserChannel(this.getIndexUserChannels(channel.id));
						if (this.inChannel)
							this.resetInChannel(this.inChannel);
					}
				});
			}
			else
				this.updateChannel(channel);
		},
		updateChannelNamePassword(channel: Channel, newNamePassword?: { name: string, password: string | null, removePassword: boolean, userWhoChangeName: User }) {
			const userStore = useUserStore();
			if (newNamePassword && newNamePassword.userWhoChangeName.id === userStore.userData.id) {
				if (this.inChannel && ((newNamePassword.name != '' && newNamePassword.name !== this.inChannel.name) || (!this.inChannel.password && newNamePassword.password !== '') || newNamePassword.removePassword)) {
					socket.emit('chatChannelNamePassword', channel, newNamePassword, (body: any[]) => {
						const channelUpdated: Channel = body[0];
						this.updateChannel(channelUpdated);
						const userStore = useUserStore();
						if (newNamePassword.name !== null)
							this.addAutomaticMessage(channel, userStore.userData, 'change the channel name to ' + newNamePassword.name);
						if (this.inChannel && this.inChannel.password && newNamePassword.password !== null)
							this.addAutomaticMessage(channel, userStore.userData, 'changed the password of ' + channel.name);
						else if (this.inChannel && !this.inChannel.password && newNamePassword.password !== null)
							this.addAutomaticMessage(channel, userStore.userData, 'added a Password to ' + channel.name);
					});
				}
			}
			else
				this.updateChannel(channel)
		},
		updateBanList(channel: Channel, newBanned: {list: User[], userWhoSelect: User },
				selection?: {unlisted: User[], listed: User[] } | null,) {
			const userStore = useUserStore();
			if (newBanned.userWhoSelect.id ===  userStore.userData.id && selection) {
				this.addAutomaticMessageSelection(channel, selection, '->got unBanned by ' + newBanned.userWhoSelect.username,
					'-> got Banned by ' + newBanned.userWhoSelect.username)
				socket.emit('chatChannelBan', channel, newBanned, (body: any[]) => {
					const channelUpdated: Channel = body[0];
				 	this.updateChannel(channelUpdated);
				});
			}
			else {
				const user = newBanned.list.find(user => user. id === userStore.userData.id);
				if (user && channel.id) {
					this.deleteUserChannel(this.getIndexChannels(channel.id));
					this.resetInChannel(channel);
					const toast = useToast();
					toast.info('you have been banned from channel ' + channel.name + " by " + newBanned.userWhoSelect.username);
				}
				else
					this.updateChannel(channel);
			}
		},
		updateMuteList(channel: Channel, newMuted?: {list: User[], userWhoSelect: User },
				selection?: {unlisted: User[], listed: User[] } | null) {
			const userStore = useUserStore();
			if (newMuted && newMuted.userWhoSelect.id === userStore.userData.id && selection) {
				socket.emit('chatChannelMute', channel, newMuted, (body: any[]) => {
					const channelUpdated: Channel = body[0];
					this.addAutomaticMessageSelection(channel, selection, '->got unMuted by ' + newMuted.userWhoSelect.username,
					'-> got Muted by ' + newMuted.userWhoSelect.username);
				 	this.updateChannel( channelUpdated);
				});
			}
			else
				this.updateChannel(channel);
		},
		updateAdminList(channel: Channel, newAdmin?: {list: User[], userWhoSelect: User },
				selection?: {unlisted: User[], listed: User[] } | null) {
			const userStore = useUserStore();
			if (newAdmin && newAdmin.userWhoSelect.id === userStore.userData.id && selection) {
				socket.emit('chatChannelAdmin', channel, newAdmin, (body: any[]) => {
					const channelUpdated: Channel = body[0];
					this.addAutomaticMessageSelection(channel, selection, '->loose Admin status by ' + newAdmin.userWhoSelect.username,
					'-> got Admin status by ' + newAdmin.userWhoSelect.username);
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
					this.addAutomaticMessageSelection(channel, { unlisted: [], listed: newKicked.list }, '',
					'-> ' + ' kicked by ' + newKicked.userWhoSelect.username);
				})
			}
			else {
				const user = newKicked.list.find(user => user.id === userStore.userData.id);
				if (user && channel.id) {
					this.deleteUserChannel(this.getIndexChannels(channel.id));
					this.resetInChannel(channel);
					const toast = useToast();
					toast.info('you have been Kicked from channel ' + channel.name + " by " + newKicked.userWhoSelect.username);
				}
				else
					this.updateChannel(channel)
			}
		},
		addAutomaticMessageSelection(channel: Channel, selection: {unlisted: User[], listed: User[] },
				messageUnListed: string, messageListed: string) {
			if (selection.unlisted.length !== 0) {
				let userNameInUnListed = '';
				let i= -1;
				while(++i < selection.unlisted.length - 1)
					userNameInUnListed += selection.unlisted[i].username + ", ";
				userNameInUnListed += selection.unlisted[i].username + " ";
				const newMessage = '🔴　' + userNameInUnListed + messageUnListed;
				this.sendMessage(newMessage, MessageType.AUTOMATIC_MESSAGE);
			}
			if (selection.listed.length !== 0) {
				let userNameInListed = '';
				const userStore = useUserStore();
				let i = -1;
				while(++i < selection.listed.length - 1) {
					if (selection.listed[i].username !== userStore.userData.username)
						userNameInListed += selection.listed[i].username + ",  ";
				}
				if (selection.listed[i].username !== userStore.userData.username)
					userNameInListed += selection.listed[i].username + " ";
				const newMessage = '⚪️　' + userNameInListed + messageListed;
				this.sendMessage(newMessage, MessageType.AUTOMATIC_MESSAGE);
			}
		},
		addAutomaticMessage(channel: Channel, user: User, msg: string) {
			const newMessage = '⚪️　' + user.username + ' ' + msg;
			this.sendMessage(newMessage, MessageType.AUTOMATIC_MESSAGE);
		},
		sendMessage(newMessage: string, type: MessageType) {
			const userStore = useUserStore();
			if (newMessage != '') {
				const now = new Date().toLocaleString();
				const messageDTO: Message = {
					date: now,
					message: newMessage,
					idSender: type === MessageType.AUTOMATIC_MESSAGE ? -1 : userStore.userData.id,
					read: false,
					type: type
				};
				if (this.inDiscussion) {
					messageDTO['idChat'] = this.inDiscussion.id;
					const chat: Discussion = this.inDiscussion;
					socket.emit('chatDiscussionMessage', this.inDiscussion.user.id, messageDTO, (body: any[]) => {
						const discu: Discussion = body[0];
						const msg: Message = body[1];
						console.log('chatDiscussionMessage', msg, 'Discussion', discu);
						chat.messages.push(msg)
					});
				}
				else if (this.inChannel) {
					messageDTO['idChat'] = this.inChannel.id;
					const chat: Channel = this.inChannel;
					socket.emit('chatChannelMessage', { id: this.inChannel.id, type: this.inChannel.type }, messageDTO, (body: any[]) => {
						const channel: Channel = body[0];
						const msg: Message = body[1];
						console.log('channel Message', msg);
						if (!msg) {
							console.log('ERROR chatChannelMessage', this.inChannel, 'messageDTO', messageDTO);
						}
						chat.messages.push(msg)
					});
				}
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
		updateChannel(channelUpdated: Channel) {
			const index = this.getIndexUserChannels(channelUpdated.id);
			if (index >= 0) {
				this.userChannels[index] = channelUpdated;
				if (this.inChannel && this.inChannel.id === channelUpdated.id)
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
					return 1;
				}
			}
			return 0;
		},
		channelTypeToString(channel: Channel) {
			if (channel.type === ChatStatus.PRIVATE)
				return 'PRIVATE';
			else if (channel.type === ChatStatus.PROTECTED)
				return 'PROTECTED';
			else
				return 'PUBLIC';
		},
	},
});
