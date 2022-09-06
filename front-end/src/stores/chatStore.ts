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
import PartToDisplay from '@/types/ChatPartToDisplay';
import ChannelsListVue from '@/components/Chat/ChannelsList.vue';

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
		messages: [],
		isLoading: false
	}),
	getters: {
		leftPartIsDiscussion: (state) => state.cardLeftPartToDisplay === PartToDisplay.DISCUSSIONS,
		displayChannel: (state) => state.cardRightPartToDisplay === PartToDisplay.CHANNELS,
		displayChannelSettings: (state) => state.cardRightPartToDisplay === PartToDisplay.CHANNEL_SETTINGS,
		displayAddChannel: (state) => state.cardRightPartToDisplay === PartToDisplay.ADD_CHANNEL,
		displayAddDiscussion: (state) => state.cardRightPartToDisplay === PartToDisplay.ADD_DISCUSSION,
		displayChat: (state) => state.cardRightPartToDisplay === PartToDisplay.CHAT,
		isProtectedChannel: (state) => state.inChannel?.type === ChatStatus.PROTECTED && !state.inChannelRegistration,
		userIsInChannel: (state) => {
			return (userToCheck: User) => state.inChannel?.users.includes(userToCheck)
		},
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
		async fetchAll() {
			try {
				await Promise.all([this.fetchUserChannels(), this.fetchUserDiscussions()])
			} catch (error: any) {
				throw error;
			}
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
		addNewChannel(user: User, channel: Channel) {
			this.userChannels.push(channel);
			const toast = useToast();
			toast.info('you have been added in ' + channel.name + " by " + user.username);	
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
		addUsersToChannel(channel: Channel, users: User[], inviter?: User) {
			if (this.inChannel && this.inChannel.name === channel.name)
				for(const user of users)
					this.inChannel.users.push(user);
			else {
				const index = this.getIndexUserChannels(channel.name);
				if (index < 0) {
					if (inviter) this.addNewChannel(inviter, channel)
					for(const user of users)
						this.userChannels[this.userChannels.length - 1].users.push(user);
				}
				else {
					for(const user of users)
						this.userChannels[index].users.push(user);
				}
			}
		},
		createNewChannel(newChannel: Channel, selection: User[]) {
			const userStore = useUserStore();
			this.userChannels.length ? this.userChannels.unshift(newChannel) : this.userChannels.push(newChannel);
			newChannel.users.unshift(userStore.userData);
			socket.emit('chatChannelCreate', userStore.userData, newChannel);
			const type = this.channelTypeToString(newChannel);
			this.addAutomaticMessage(newChannel, {unlisted:[userStore.userData], listed: selection}, ' is creator of this ' + type + ' channel'
				, 'have been added to ' + newChannel.name + ' by ' + userStore.userData.username);
			this.loadChannel(this.userChannels[0]);
		},
		joinNewChannel(channel : Channel) {
			const userStore = useUserStore();
			this.userChannels.length ? this.userChannels.unshift(channel) : this.userChannels.push(channel);
			this.inChannel = this.userChannels[0];
			socket.emit('chatChannelJoin', channel, userStore.userData);
			this.addAutomaticMessage(channel, { unlisted: [], listed: [userStore.userData]}, '', ' just joined the channel')
			this.setRightPartToDisplay(PartToDisplay.CHAT);
		},
		inviteUserToPrivateChannel(channel: Channel, users: User[]) {
			const userStore = useUserStore();
			socket.emit('chatChannelInvitation', channel, users, userStore.userData);
			if (this.inChannel && this.inChannel.name === channel.name) {
				for(const user of users)
					this.inChannel.users.push(user)
				this.addAutomaticMessage(channel, { unlisted: [], listed: users}, '', ' have been invited into the channel')
			}
			else {
				const index = this.getIndexUserChannels(channel.name);
				if (index >= 0) {
					for(const user of users)
						this.userChannels[index].users.push(user);
					this.addAutomaticMessage(this.userChannels[index], { unlisted: [], listed: users}, '', ' have been invited into the channel')
				}
			}
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
			if ((userStore.userData.id === user.id)) {
				this.deleteUserFromChannel(channel, user);
				const leaveMessage = {
					date: new Date().toLocaleString(),
					message: '🔴　'+ user.username + ' just leaved the channel',
					idSender: -1,
					read: false
				};
				channel.messages.push(leaveMessage);
				socket.emit('chatChannelMessage', channel, channel.messages[channel.messages.length - 1]);
				this.setChannelOwner(channel, [user])
				this.deleteUserChannel(this.getIndexUserChannels(channel.name));
				this.inChannel = null;
				this.setRightPartToDisplay(PartToDisplay.CHAT);
			}
			else {
				const index = this.getIndexUserChannels(channel.name);
				this.deleteUserFromChannel(this.userChannels[index], user);
				this.setChannelOwner(this.userChannels[index], [user])
			}
		},
		UpdateChannelName(channel: Channel, newName: { name: string, userWhoChangeName: User }, emit: boolean) {
			if (emit && this.inChannel && this.inChannel.name === channel.name) {
				const newChannelNameMessage = {
					date: new Date().toLocaleString(),
					message: '⚪️　' + newName.userWhoChangeName.username + ' change the channel name to ' + newName.name.toUpperCase,
					idSender: -1,
					read: false
				};
				channel.messages.push(newChannelNameMessage);
				socket.emit('chatChannelName', channel, newName);
				socket.emit('chatChannelMessage', channel, channel.messages[channel.messages.length - 1]);
			}
			if (this.inChannel && this.inChannel.name === channel.name)
				this.inChannel.name = newName.name;
			else {
				const index = this.getIndexUserChannels(channel.name);
				this.userChannels[index].name = newName.name;
			}
		},
		updateBanList(channel: Channel, selection: {unlisted: User[], listed: User[] } | null,
				newBanList: {newList: User[], userWhoSelect: User }) {
			if (selection) {
				this.addAutomaticMessage(channel, selection, '->got unBanned by ' + newBanList.userWhoSelect.username,
					'-> got Banned by ' + newBanList.userWhoSelect.username)
				socket.emit('chatChannelBan', channel, newBanList);
			}
			
			/////////////////////////////////////////////////////////////////// best to do in back
			if (this.inChannel && this.inChannel.name === channel.name) {
				this.inChannel.banned = newBanList.newList
				for (const banned of channel.banned)
					this.deleteUserFromChannel(this.inChannel, banned);
				if (selection && selection.listed)
					this.setChannelOwner(this.inChannel, selection.listed);
			}
			else {
				const index = this.getIndexUserChannels(channel.name);
				this.userChannels[index].banned = newBanList.newList;
				for (const banned of channel.banned)
					this.deleteUserFromChannel(this.userChannels[index], banned);
				if (selection && selection.listed)
					this.setChannelOwner(this.userChannels[index], selection.listed);
			}
			///////////////////////////////////////////////////////////////////
			const userStore = useUserStore();
			const indexUser = newBanList.newList.findIndex(user => user.id === userStore.userData.id)
			if (indexUser >= 0) {
				const toast = useToast();
				if (this.inChannel && this.inChannel.name === channel.name) this.inChannel = null;
				this.setRightPartToDisplay(PartToDisplay.CHAT);
				this.deleteUserChannel(this.getIndexUserChannels(channel.name))
				toast.info('you have been banned from channel ' + channel.name + " by " + newBanList.userWhoSelect.username);
			}
		},
		updateMuteList(channel: Channel, selection: {unlisted: User[], listed: User[] } | null,
				newMutedList: {newList: User[], userWhoSelect: User }) {
			if (selection) {
				this.addAutomaticMessage(channel, selection, '->got unMuted by ' + newMutedList.userWhoSelect.username,
					'-> got Muted by ' + newMutedList.userWhoSelect.username);
				socket.emit('chatChannelMute', channel, newMutedList);
			}
			if (this.inChannel && this.inChannel.name === channel.name)
				this.inChannel.muted = newMutedList.newList
			else {
				const index = this.getIndexUserChannels(channel.name);
				this.userChannels[index].muted = newMutedList.newList;
			}
		},
		updateAdminList(channel: Channel, selection: {unlisted: User[], listed: User[] } | null,
				newAdminList: {newList: User[], userWhoSelect: User }) {
			if (selection) {
				this.addAutomaticMessage(channel, selection, '->loose Admin status by ' + newAdminList.userWhoSelect.username,
					'-> got Admin status by ' + newAdminList.userWhoSelect.username);
				socket.emit('chatChannelAdmin', channel, newAdminList);
			}
			if (this.inChannel && this.inChannel.name === channel.name)
				this.inChannel.admins = newAdminList.newList;
			else {
				const index = this.getIndexUserChannels(channel.name);
				this.userChannels[index].admins = newAdminList.newList;
			}
			
		},
		setChannelOwner(channel: Channel, selection: User[]) {
			////////////////////////////////////////////////////////////////////////////// best to do in back
			const indexOwner = selection.findIndex(user => user.id === channel.owner.id)
			if (indexOwner >= 0) {
				if (channel.admins.length) {
					channel.owner = channel.admins[0];
					this.addAutomaticMessage(channel, {unlisted:[], listed: selection}, '', ' is now owner of the channel.')
				}
				else
					socket.emit('chatChannelDelete', channel)
			}
			//////////////////////////////////////////////////////////////////////////////
		},
		addAutomaticMessage(channel: Channel, selection: {unlisted: User[], listed: User[] },
				messageUnListed: string, messageListed: string) {
			if (selection.unlisted.length !== 0) {
				let userNameInUnListed = '';
				let i= -1;
				while(++i < selection.unlisted.length - 1)
					userNameInUnListed += selection.unlisted[i].username + ", ";
				userNameInUnListed += selection.unlisted[i].username + " ";
				const newMessage = {
					date: new Date().toLocaleString(),
					message: '🔴　' + userNameInUnListed + messageUnListed,
					idSender: -1,
					read: false
				};	
				if (this.inChannel && this.inChannel.name === channel.name) {
					this.inChannel.messages.push(newMessage);
					socket.emit('chatChannelMessage', channel, this.inChannel.messages[this.inChannel.messages.length - 1]);
				}
				else {
					const index = this.getIndexUserChannels(channel.name);
					this.userChannels[index].messages.push(newMessage);
					socket.emit('chatChannelMessage', channel, this.userChannels[index].messages[this.userChannels[index].messages.length - 1]);
				}
				
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
				const newMessage = {
					date: new Date().toLocaleString(),
					message: '⚪️　' + userNameInListed + messageListed,
					idSender: -1,
					read: false
				};
				if (this.inChannel && this.inChannel.name === channel.name) {
					this.inChannel.messages.push(newMessage);
					socket.emit('chatChannelMessage', channel, this.inChannel.messages[this.inChannel.messages.length - 1]);
				}
				else {
					const index = this.getIndexUserChannels(channel.name);
					this.userChannels[index].messages.push(newMessage);
					socket.emit('chatChannelMessage', channel, this.userChannels[index].messages[this.userChannels[index].messages.length - 1]);
				}
			}
		},
		sendMessage(newMessage: string, type?: string) {
			const userStore = useUserStore();
			if (newMessage != '') {
				const now = new Date().toLocaleString();
				const data: Message = {
					date: now,
					message: newMessage,
					idSender: userStore.userData.id,
					read: false,
					type: type
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
					this.addNewDiscussion(newDiscussion);
				}
			}
			else
				this.userDiscussions[index].messages.push(data);
		},
		addChannelMessage(channel: Channel, data: Message) {
			if (this.inChannel?.name === channel.name)
				this.inChannel.messages.push(data)
			else {
				const index = this.getIndexUserChannels(channel.name);
				this.userChannels[index].messages.push(data);
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
		channelTypeToString(channel: Channel) {
			if (channel.type === ChatStatus.PRIVATE)
				return 'PRIVATE';
			else if (channel.type === ChatStatus.PROTECTED)
				return 'PROTECTED';
			else
				return 'PUBLIC';
		},
		UsersNotInChannels() {
			const globalStore = useGlobalStore();
			let userNotInChannel: User[] = [];
			for(const user of globalStore.users) {
				if (!this.userIsInChannel(user))
					userNotInChannel.push(user);
			}
			const userStore = useUserStore();
			return userNotInChannel.filter(user => user.id != userStore.userData.id);
		}
	},
});
