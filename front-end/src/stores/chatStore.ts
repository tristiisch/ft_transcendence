import { defineStore } from 'pinia';
import { useUserStore } from '@/stores/userStore';
import { useGlobalStore } from '@/stores/globalStore';
import socket from '@/plugin/socketInstance';
import UserService from '@/services/UserService';
import type User from '@/types/User';
import type ChatState from '@/types/ChatState';
import type Channel from '@/types/Channel';
import type Discussion from '@/types/Discussion';
import type Message from '@/types/Message';
import ChatStatus from '@/types/ChatStatus';
import PartToDisplay from '@/types/ChatPartToDisplay';

export const useChatStore = defineStore('chatStore', {
	state: (): ChatState => ({
		channels: [],
		userDiscussions: [],
		inDiscussion: null,
		userChannels: [],
		inChannel: null,
		inChannelRegistration: false,
		cardRightPartToDisplay: PartToDisplay.CHAT,
		cardLeftPartToDisplay: PartToDisplay.DISCUSSIONS,
		cardRightTitle: 'CHAT',
	}),
	getters: {
		leftPartIsDiscussion: (state) => state.cardLeftPartToDisplay === PartToDisplay.DISCUSSIONS,
		displayChannel: (state) => state.cardRightPartToDisplay === PartToDisplay.CHANNELS,
		displayChannelSettings: (state) => state.cardRightPartToDisplay === PartToDisplay.CHANNEL_SETTINGS,
		displayAddChannel: (state) => state.cardRightPartToDisplay === PartToDisplay.ADD_CHANNEL,
		displayAddDiscussion: (state) => state.cardRightPartToDisplay === PartToDisplay.ADD_DISCUSSION,
		displayChat: (state) => state.cardRightPartToDisplay === PartToDisplay.CHAT,
		isProtectedChannel: (state) => state.inChannel?.type === ChatStatus.PROTECTED && !state.inChannelRegistration,
		getIndexChannels: (state) => { 
			return  (channelName: string) => state.channels.findIndex((channel) => channel.name === channelName);
		},
		getIndexUserChannels: (state) => {
			return  (channelName: string) => state.userChannels.findIndex((userChannel) => userChannel.name === channelName);
		},
		getIndexUserDiscussions: (state) => {
			return  (userId: number) => state.userDiscussions.findIndex((userDiscussion) => userDiscussion.user.id === userId);
		},
		getChannelsFiltered: (state) => { 
			return  (channelsToFilter: Channel[]) => state.channels.filter((channel) => !channelsToFilter.includes(channel));
		},
	},
	actions: {
		async fetchChannels() {
			try {
				const response = await UserService.getChannels();
				this.channels = response.data;
			} catch (error: any) {
				throw error;
			}
		},
		async fetchUserChannels() {
			try {
				const response = await UserService.getUserChannels();
				this.userChannels = response.data;
			} catch (error: any) {
				throw error;
			}
		},
		async fetchUserDiscussions() {
			try {
				const response = await UserService.getUserDiscussions();
				this.userDiscussions = response.data;
			} catch (error: any) {
				throw error;
			}
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
		setLeftPartToDisplay(clickedOn: string) {
			if (this.cardLeftPartToDisplay === PartToDisplay.DISCUSSIONS && clickedOn !== 'discussion') this.cardLeftPartToDisplay = PartToDisplay.CHANNELS;
			else if (this.cardLeftPartToDisplay === PartToDisplay.CHANNELS && clickedOn !== 'channels') this.cardLeftPartToDisplay = PartToDisplay.DISCUSSIONS;
		},
		loadChannel(channel: Channel) {
			if (this.inDiscussion) this.inDiscussion = null;
			this.inChannel = channel;
			this.setRightPartToDisplay(PartToDisplay.CHAT);
			this.shiftPositionUserChannel(channel);
			if (this.inChannel.type === ChatStatus.PROTECTED) {
				this.userIsRegistered(channel);
			}
		},
		loadDiscussion(discussion: Discussion) {
			if (this.inChannel) this.inChannel = null;
			this.inDiscussion = discussion;
			this.setRightPartToDisplay(PartToDisplay.CHAT);
			this.shiftPositionUserDiscussion(discussion);
		},
		addNewChannel(channel: Channel) {
			this.userChannels.push(channel);
		},
		addNewDiscussion(discussion: Discussion) {
			this.userDiscussions.push(discussion);
		},
		createNewDiscussion(newDiscussion: Discussion, load: boolean) {
			const userStore = useUserStore();
			this.userDiscussions.length ? this.userDiscussions.unshift(newDiscussion) : this.userDiscussions.push(newDiscussion)
			socket.emit('chatDiscussionCreate', userStore.userData, newDiscussion)
			if (load === true)
				this.loadDiscussion(this.userDiscussions[0]); 
		},
		addUserToChannel(channelName: string, user: User) {
			const index = this.getIndexUserChannels(channelName);
			if (index >= 0) {
				this.userChannels[index].users.push(user)
				this.userChannels[index].messages.push({
					date: new Date().toLocaleString(),
					message: '⚪️　' + user.username + ' just joined the channel',
					idSender: -1,
					read: false
				});
			}
		},
		createNewChannel(newChannel: Channel) {
			const userStore = useUserStore();
			this.userChannels.length ? this.userChannels.unshift(newChannel) : this.userChannels.push(newChannel);
			socket.emit('chatChannelCreate', userStore.userData.id, newChannel)
			this.loadChannel(this.userChannels[0]);
		},
		joinNewChannel(channel : Channel) {
			const userStore = useUserStore();
			this.userChannels.length ? this.userChannels.unshift(channel) : this.userChannels.push(channel);
			this.inChannel = this.userChannels[0];
			socket.emit('chatChannelJoin', channel.name, userStore.userData.id)
			this.setRightPartToDisplay(PartToDisplay.CHAT);
		},
		deleteUserFromChannel(channel: Channel, userToDelete: User) {
			let index = channel.admins.findIndex((user) => user.id === userToDelete.id);
			if (index >= 0) channel.admins.splice(index, 1);
			index = channel.muted.findIndex((user) => user.id === userToDelete.id);
			if (index >= 0) channel.muted.splice(index, 1);
			index = channel.users.findIndex((user) => user.id === userToDelete.id);
			if (index >= 0) channel.users.splice(index, 1);
			if (this.inChannel?.type === ChatStatus.PROTECTED) this.inChannelRegistration = false;
		},
		deleteUserDiscussion(index: number) { 
			const userStore = useUserStore();
			if (index >= 0) {
				this.userDiscussions.splice(index, 1);
				socket.emit('chatDiscussionDelete', (this.userDiscussions[index], userStore.userData.id))
			}
		},
		deleteUserChannel(indexUserChannel: number) {
			if (indexUserChannel >= 0) this.userChannels.splice(indexUserChannel, 1);
		},
		leaveChannel(channel: Channel, user: User) {
			const userStore = useUserStore();
			this.deleteUserFromChannel(channel, user);
			if (channel.users.length > 1) {
				if (channel.owner.id === user.id) channel.owner = channel.admins[0];
				const leaveMessage = {
					date: new Date().toLocaleString(),
					message: '⚪️　'+ user.username + ' just leaved the channel',
					idSender: -1,
					read: false
				};
				if (this.inChannel === channel) {
					this.inChannel.messages.push(leaveMessage);
					socket.emit('chatChannelMessage', channel, this.inChannel.messages[this.inChannel.messages.length - 1]);
				}
				else {
					const index = this.getIndexUserChannels(channel.name);
					if (index >= 0) this.userChannels[index].messages.push(leaveMessage);
					socket.emit('chatChannelMessage', channel, this.userChannels[index].messages[this.userChannels[index].messages.length - 1]);
				}	
				if (userStore.userData.id === user.id) socket.emit('chatChannelLeave', userStore.userData);
			}
			else 
				if (userStore.userData.id === user.id) socket.emit('chatChannelDelete', channel)
			if (userStore.userData.id === user.id) {
				this.deleteUserChannel(this.getIndexUserChannels(channel.name));
				this.inChannel = null;
				this.setRightPartToDisplay(PartToDisplay.CHAT);
			}
		},
		UpdateChannelName(channel: Channel, newName: string) {
			if (this.inChannel === channel) {
				this.inChannel.name = newName;
				socket.emit('chatChannelName', this.inChannel, newName);
			}
			else {
				const index = this.getIndexUserChannels(channel.name);
				this.userChannels[index].name = newName;
			}		
		},
		updateBanList(channel: Channel, newBanList: User[]) {
			if (this.inChannel === channel) {
				this.inChannel.banned = newBanList
				socket.emit('chatChannelBan', channel, newBanList);
			}
			else {
				const index = this.getIndexUserChannels(channel.name);
				this.userChannels[index].banned = newBanList;
			}
			for (const banned of channel.banned) {
				if (this.inChannel) this.deleteUserFromChannel(this.inChannel, banned);
			}
		},
		updateMuteList(channel: Channel, newMutedList: User[]) {
			if (this.inChannel === channel) {
				this.inChannel.muted = newMutedList
				socket.emit('chatChannelMute', channel, newMutedList);
			}
			else {
				const index = this.getIndexUserChannels(channel.name);
				this.userChannels[index].muted = newMutedList;
			}
		},
		updateAdminList(channel: Channel, newAdminList: User[]) {
			if (this.inChannel === channel) {
				this.inChannel.admins = newAdminList
				socket.emit('chatChannelAdmin', channel, newAdminList);
			}
			else {
				const index = this.getIndexUserChannels(channel.name);
				this.userChannels[index].admins = newAdminList;
			}
		},
		sendMessage(newMessage: string) {
			const userStore = useUserStore();
			if (newMessage != '') {
				const now = new Date().toLocaleString();
				const data: Message = {
					date: now,
					message: newMessage,
					idSender: userStore.userData.id,
					read: false
				};
				if (this.inDiscussion) {
					this.inDiscussion.messages.push(data);
					socket.emit('chatDiscussionMessage', this.inDiscussion, this.inDiscussion.messages[this.inDiscussion.messages.length - 1]);
				}
				else if (this.inChannel) {
					this.inChannel.messages.push(data)
					socket.emit('chatChannelMessage', this.inChannel, this.inChannel.messages[this.inChannel.messages.length - 1]);
				}
			}
		},
		addDiscussionMessage(discussion: Discussion, data: Message) {
			const globalStore = useGlobalStore();
			const index = this.getIndexUserDiscussions(data.idSender);
			if (index < 0)  {
				const user =  globalStore.getUser(data.idSender);
				if (user) {
				const newDiscussion: Discussion = { 
					type: ChatStatus.DISCUSSION,
					user: user,
					messages: [data]
					};
					this.createNewDiscussion(newDiscussion, false);
				}	
			}
			else
				this.userDiscussions[index].messages.push(data);
		},
		addChannelMessage(channel: Channel, data: Message) {
			const newMessage = {
				date: data.date,
				message: data.message,
				idSender: data.idSender,
				read: false
			};
			if (this.inChannel?.name === channel.name)
				this.inChannel.messages.push(newMessage)
			else {
				const index = this.getIndexUserChannels(channel.name);
				this.userChannels[index].messages.push(newMessage);
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
		registrationToChannel() {
			this.inChannelRegistration = true;
		},
		userIsRegistered(channel: Channel) {
			const userStore = useUserStore();
			for (const user of channel.users)
					if (user.id === userStore.userData.id) this.inChannelRegistration = true;
		},
		shiftPositionUserChannel( channel: Channel) { 
			const fromIndex = this.getIndexUserChannels(channel.name)
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
		isNewDiscussion(newDiscussion: Discussion) {
			for (const discussion of this.userDiscussions) {
				if (discussion.user.id === newDiscussion.user.id) {
					this.loadDiscussion(discussion);
					return 1;
				}
			}
			return 0;
		},
	},
});
