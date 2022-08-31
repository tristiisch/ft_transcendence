import { defineStore } from 'pinia';
import UserService from '@/services/UserService';
import type User from '@/types/User';
import type ChatState from '@/types/ChatState';
import type Channel from '@/types/Channel';
import type Discussion from '@/types/Discussion';
import type Message from '@/types/Message';
import ChatStatus from '@/types/ChatStatus';
import PartToDisplay from '@/types/ChatPartToDisplay';
import socket from '@/plugin/socketInstance';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
type selectedItems = User[] | Channel[];
type selectedItem = User | Channel;

export const useChatStore = defineStore('chatStore', {
	state: (): ChatState => ({
		users: [],
		friends: [],
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
		selectedItems: [],
	}),
	getters: {
		isLoading: (state) => (state.userDiscussions && state.userChannels ? false : true),
		leftPartIsDiscussion: (state) => state.cardLeftPartToDisplay === PartToDisplay.DISCUSSIONS,
		displayChannel: (state) => state.cardRightPartToDisplay === PartToDisplay.CHANNELS,
		displayChannelSettings: (state) => state.cardRightPartToDisplay === PartToDisplay.CHANNEL_SETTINGS,
		displayAddChannel: (state) => state.cardRightPartToDisplay === PartToDisplay.ADD_CHANNEL,
		displayAddDiscussion: (state) => state.cardRightPartToDisplay === PartToDisplay.ADD_DISCUSSION,
		displayChat: (state) => state.cardRightPartToDisplay === PartToDisplay.CHAT,
		isProtectedChannel: (state) => state.inChannel?.type === ChatStatus.PROTECTED && !state.inChannelRegistration,
		isTypeArrayUsers: (state) => {
			return (array: selectedItems): array is User[] => (array as User[])[0] === undefined || (array as User[])[0].username !== undefined;
		},
		isTypeUser: (state) => {
			return (user: selectedItem): user is User => (user as User).username !== undefined;
		},
		getPlayerName: (state) => {
			return (senderId: number) => state.users.find((user) => user.id === senderId)?.username;
		},
		getPlayerAvatar: (state) => {
			return (senderId: number) => state.users.find((user) => user.id === senderId)?.avatar;
		},
		getPlayerId: (state) => {
			return (senderId: number) => state.users.find((user) => user.id === senderId)?.id;
		},
		getUser: (state) => {
			return (userId: number) => state.users.find((user) => user.id === userId);
		},
	},
	actions: {
		async fetchUsers() {
			try {
				const response = await UserService.getUsers();
				this.users = response.data;
			} catch (error: any) {
				throw error;
			}
		},
		async fetchChannels() {
			try {
				const response = await UserService.getChannels();
				this.Channels = response.data;
			} catch (error: any) {
				throw error;
			}
		},
		async fetchfriends() {
			try {
				const response = await UserService.getUserfriends(userStore.userData.id);
				this.friends = response.data;
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
		loadChannel(channel: Channel) {
			if (this.inDiscussion) this.inDiscussion = null;
			this.inChannel = channel;
			this.setRightPartToDisplay(PartToDisplay.CHAT);
			this.messages = this.inChannel.messages;
			const fromIndex = this.userChannels.findIndex((userChannel) => userChannel.name === channel.name);
			if (fromIndex > 0) {
				// shift channel to top of channel list
				const element = this.userChannels.splice(fromIndex, 1)[0];
				this.userChannels.unshift(element);
			}
			if (this.inChannel.type === ChatStatus.PROTECTED) {
				for (const user of channel.users) if (user.id === userStore.userData.id) this.inChannelRegistration = true;
			}
		},
		loadDiscussion(discussion: Discussion) {
			if (this.inChannel) this.inChannel = null;
			this.inDiscussion = discussion;
			this.messages = this.inDiscussion.messages;
			this.setRightPartToDisplay(PartToDisplay.CHAT);
			const fromIndex = this.userDiscussions.findIndex((element) => element.user.id === discussion.user.id);
			if (fromIndex > 0) {
				// shift discussion to top of discussion list
				const element = this.userDiscussions.splice(fromIndex, 1)[0];
				this.userDiscussions.unshift(element);
			}
		},
		async addNewChannel(newChannel: Channel) {
			try {
				UserService.addChannel(newChannel);
				if (this.userChannels.length) this.userChannels.unshift(newChannel);
				else this.userChannels.push(newChannel);
				this.channels.push(newChannel);
				this.loadChannel(this.userChannels[0]);
				this.selectedItems = [];
			} catch (error: any) {
				throw error;
			}
		},
		async addNewDiscussion(user: User) {
			if (this.userDiscussions) {
				for (const discussion of this.userDiscussions) {
					if (discussion.user.id === user.id) {
						this.loadDiscussion(discussion);
						this.selectedItems = [];
						return;
					}
				}
			}
			try {
				const newDiscussion: Discussion = { type: ChatStatus.DISCUSSION, user: user, messages: [] as Message[] };
				UserService.addDiscussion(newDiscussion);
				if (this.userDiscussions.length) this.userDiscussions.unshift(newDiscussion);
				else this.userDiscussions.push(newDiscussion);
				this.loadDiscussion(this.userDiscussions[0]);
				this.selectedItems = [];
			} catch (error: any) {
				throw error;
			}
		},
		joinNewChannel() {
			//send to back
			if (!this.isTypeUser(this.selectedItems[0])) this.userChannels.unshift(this.selectedItems[0]);
			this.inChannel = this.userChannels[0];
			this.setRightPartToDisplay(PartToDisplay.CHAT);
			this.selectedItems = [];
		},
		deleteDiscussion(index: number) {
			if (this.userDiscussions) {
				if (index >= 0) {
					this.userDiscussions.splice(index, 1);
					// socket.emit('chat-discussion-delete', discussions.value[index])
				}
			}
		},
		deleteUserChannel(index: number) {
			if (this.userChannels) {
				if (index >= 0) {
					this.userChannels.splice(index, 1);
					// socket.emit('chat-userChannel-delete', channelToDelete)
				}
			}
		},
		deleteChannel(index: number) {
			if (this.userChannels) {
				if (index >= 0) {
					this.userChannels.splice(index, 1);
					// socket.emit('chat-channel-delete', channelToDelete)
				}
			}
		},
		deleteUserFromChannel(userToDelete: User) {
			if (this.inChannel) {
				let index = this.inChannel.admins.findIndex((user) => user.id === userToDelete.id);
				if (index >= 0) this.inChannel.admins.splice(index, 1);
				index = this.inChannel.muted.findIndex((user) => user.id === userToDelete.id);
				if (index >= 0) this.inChannel.muted.splice(index, 1);
				index = this.inChannel.users.findIndex((user) => user.id === userToDelete.id);
				if (index >= 0) this.inChannel.users.splice(index, 1);
				if (this.inChannel?.type === ChatStatus.PROTECTED) this.inChannelRegistration = false;
			}
		},
		registrationToChannel() {
			this.inChannelRegistration = true;
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
		setSelectedItem(selectedItem: User | Channel, singleSelection: boolean) {
			if (!singleSelection) {
				if (this.isTypeArrayUsers(this.selectedItems) && this.isTypeUser(selectedItem)) this.selectedItems.push(selectedItem);
				else if (!this.isTypeArrayUsers(this.selectedItems) && !this.isTypeUser(selectedItem)) this.selectedItems.push(selectedItem);
			} else this.selectedItems[0] = selectedItem;
		},
		unsetSelectItem(itemToUnselectId: number, singleSelection: boolean) {
			if (!singleSelection) {
				const indexArraycurrentSelection = this.selectedItems.findIndex((item) => item.id === itemToUnselectId);
				this.selectedItems.splice(indexArraycurrentSelection, 1);
			} else this.selectedItems.splice(0, 1);
		},
		checkChangeInArray(baseArray: User[]) {
			for (const userBa of baseArray) {
				const index = this.selectedItems.findIndex((user) => user.id === userBa.id);
				if (index < 0) return true;
			}
			for (const selectedUser of this.selectedItems) {
				const index = baseArray.findIndex((user) => user.id === selectedUser.id);
				if (index < 0) return true;
			}
			return false;
		},
		UpdateChannelNamePassword(password: string, name: string) {
			if (this.inChannel) {
				if (password != '' && password != this.inChannel.password) {
					this.inChannel.password = password;
					//post password to back
				}
				if (name != '' && name != this.inChannel.name) {
					this.inChannel.name = name;
					//post password to back
				}
			}
		},
		updateBanArray() {
			if (this.inChannel && this.isTypeArrayUsers(this.selectedItems)) {
				if (this.checkChangeInArray(this.inChannel.banned)) {
					for (const selectedUser of this.selectedItems) this.deleteUserFromChannel(selectedUser);
					this.inChannel.banned = this.selectedItems;
					//socket.emit('chat-channel-ban', selectedUsers)
				}
				this.selectedItems = [];
			}
		},
		updateMuteArray() {
			if (this.inChannel && this.isTypeArrayUsers(this.selectedItems)) {
				if (this.checkChangeInArray(this.inChannel.muted)) {
					this.inChannel.muted = this.selectedItems;
					//socket.emit('chat-channel-admin', selectedUsers);
					console.log('jorjoorjt');
				}
				this.selectedItems = [];
			}
		},
		updateAdminArray() {
			if (this.inChannel && this.isTypeArrayUsers(this.selectedItems)) {
				if (this.checkChangeInArray(this.inChannel.admins)) {
					this.inChannel.admins = this.selectedItems;
					//socket.emit('chat-channel-mute', selectedUsers);
				}
				this.selectedItems = [];
			}
		},
		leaveChannel(user: User) {
			if (this.inChannel) {
				let isOwner = false;
				if (this.inChannel.owner.id === userStore.userData.id) isOwner = true;
				if (this.inChannel.users.length > 1) {
					this.deleteUserFromChannel(user);
					if (isOwner)
						this.inChannel.owner = this.inChannel.admins[0];
				}
				else {
					const index = this.channels.findIndex((channel) => channel.name === this.inChannel?.name);
					this.deleteChannel(index);
				}
				const index = this.userChannels.findIndex((userChannel) => userChannel.name === this.inChannel?.name);
				this.deleteUserChannel(index);
				this.inChannel = null;
				this.setRightPartToDisplay(PartToDisplay.CHAT);
				//socket.emit('chat-channel-leave', userStore.userData);
				//socket.emit('chat-channel-leave', userStore.userData);
			}
		},
		sendMessage(newMessage: string) {
			if (newMessage != '') {
				const now = new Date().toLocaleString();
				this.messages.push({
					date: now,
					message: newMessage,
					idSender: userStore.userData.id,
				});
				// socket.emit('chat-message', {
				// 	date: now,
				// 	messageData: newMessage,
				// 	id: userStore.userData.id
				// });
			}
		},
	},
});
