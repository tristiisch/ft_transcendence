<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { useChatStore } from '@/stores/chatStore';
import { useGlobalStore } from '@/stores/globalStore';
import { ref, onBeforeMount, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UserService from '@/services/UserService';
import socket from '@/plugin/socketInstance';
import PartToDisplay from '@/types/ChatPartToDisplay';
import type Message from '@/types/Message';
import ChatStatus from '@/types/ChatStatus';
import type User from '@/types/User';
import type Channel from '@/types/Channel';
import type Discussion from '@/types/Discussion';
import ChannelsList from '@/components/Chat/ChannelsList.vue';
import ChannelAdd from '@/components/Chat/AddChannel/ChannelAdd.vue';
import DiscussionAdd from '@/components/Chat/DiscussionAdd.vue';
import ButtonPlus from '@/components/Button/ButtonPlus.vue';
import ButtonDelete from '@/components/Button/ButtonDelete.vue';
import ChannelPasswordQuery from '@/components/Chat/ChannelPasswordQuery.vue';
import SettingsChannel from '@/components/Chat/ChannelSettings/SettingsChannel.vue';
import DiscussionList from '@/components/Chat/DiscussionList.vue';
import Chat from '@/components/Chat/ChatRoot.vue';
import { useToast } from 'vue-toastification';

const userStore = useUserStore();
const toast = useToast();
const chatStore = useChatStore();
const route = useRoute();
const router = useRouter();
const displayDelete = ref([] as boolean[]);
const isLoading = ref(false);
const scroll = ref<HTMLInputElement | null>(null);

function addButton() {
	if (chatStore.cardLeftPartToDisplay === PartToDisplay.DISCUSSIONS) return 'Add discussion';
	else return 'Add channel';
}

function memberInChannel(channel: Channel) {
	return channel.type != ChatStatus.PRIVATE || (channel.type === ChatStatus.PRIVATE && channel.users.find((user) => user.id === userStore.userData.id));
}

function setDisplayDelete(index: number) {
	displayDelete.value[index] = true;
}

function unsetDisplayDelete(index: number) {
	displayDelete.value[index] = false;
}

socket.on("chatChannelCreate", (channel: Channel, creator: User) => {
	chatStore.addNewChannel(creator, channel);
});

socket.on("chatChannelDelete", (channel: Channel) => {
	chatStore.deleteUserChannel(channel);
});

socket.on("chatChannelJoin", (channelUpdated: Channel) => {
	chatStore.addUsersToChannel(channelUpdated);
});

socket.on("chatChannelInvitation", (channelUpdated: Channel, inviter: User) => {
	chatStore.addUsersToChannel(channelUpdated, inviter);
});

socket.on("chatChannelLeave", (channel: Channel, user: User) => {
	chatStore.leaveChannel(channel, user);
});

socket.on("chatChannelBan", (channel: Channel, newBanned: { list: User[], userWhoSelect: User}) => {
	chatStore.updateBanList(channel, newBanned)
});

socket.on("chatChannelAdmin", (channel: Channel) => {
	chatStore.updateAdminList(channel)
});

socket.on("chatChannelMute", (channel: Channel) => {
	chatStore.updateMuteList(channel)
});

socket.on("chatChannelKick", (channel: Channel, newKicked: { list: User[], userWhoSelect: User}) => {
	chatStore.KickUsers(channel, newKicked)
});

socket.on("chatDiscussionMessage", (discussion: Discussion, data: Message, user: User) => {
	chatStore.addDiscussionMessage(discussion, data, user);
});

socket.on("chatChannelMessage", (channel: Channel, data: Message) => {
	chatStore.addChannelMessage(channel, data);
});

socket.on("chatChannelNamePassword", (channel: Channel, oldId: number) => {
	chatStore.updateChannelNamePassword(channel, null, oldId);
});

socket.on("exception", (err) => {
	toast.warning(err.message)
});

function scrollToTop() {
	if (scroll.value) {
		scroll.value.scrollTop = 0;
	}
}

function changeList(clickOn: string) {
	let i = -1;
	while (++i < displayDelete.value.length) {
		if (displayDelete.value[i] === true)
			displayDelete.value[i] = false;
	}
	if (clickOn === 'discussion')
		chatStore.setLeftPartToDisplay('discussion')
	else
		chatStore.setLeftPartToDisplay('channels')
}

onBeforeMount(() => {
	isLoading.value = true
	chatStore.fetchAll()
		.then(() => {
			if (route.query.discussion) {
				if (!chatStore.isNewDiscussion(parseInt(route.query.discussion as string)) && parseInt(route.query.discussion as string) !== userStore.userData.id) {
					UserService.getUser(parseInt(route.query.discussion as string))
						.then((response) => {
							const newDiscussion: Discussion = { type: ChatStatus.DISCUSSION, user: response.data, messages: [] as Message[] };
							chatStore.createNewDiscussion(newDiscussion, true);
							chatStore.setLeftPartToDisplay('discussion');
						})
						.catch((error) => {
							router.replace({
								name: 'Error',
								params: { pathMatch: route.path.substring(1).split('/') },
								query: { code: error.response?.status, message: error.response?.data?.message }
							});
						})
						
				}
			}
			isLoading.value = false
			
		})
		.catch((error) => {
			router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status } });
		})
	if (chatStore.inDiscussion)
		chatStore.inDiscussion = null
	else (chatStore.inChannel)
		chatStore.inChannel = null
	chatStore.setRightPartToDisplay(PartToDisplay.CHAT);
});

onBeforeUnmount(() => {
	socket.off("chatChannelCreate");
	socket.off("chatChannelDelete");
	socket.off("chatChannelJoin");
	socket.off("chatChannelInvitation");
	socket.off("chatChannelLeave");
	socket.off("chatChannelBan");
	socket.off("chatChannelAdmin");
	socket.off("chatChannelMute");
	socket.off("chatChannelKick");
	socket.off("chatDiscussionMessage");
	socket.off("chatChannelMessage");
	socket.off("chatChannelNamePassword");
	socket.off("exception");
})
</script>

<template>
	<base-ui :isLoading="isLoading">
		<div class="flex flex-col h-full sm:flex-row">
			<card-left>
				<div class="flex flex-col justify-between items-center h-full w-full px-8">
					<div class="flex w-full justify-around gap-2 flex-wrap sm:pb-5">
						<button
							@click="changeList('discussion')"
							class="font-Arlon tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500"
						>
							DISCUSSIONS
						</button>
						<button
							@click="changeList('channels')"
							class="font-Arlon tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500"
						>
							CHANNELS
						</button>
					</div>
					<div id="scrollbar" class="flex flex-col overflow-x-auto sm:overflow-y-auto h-full w-full pr-2" ref="scroll">
						<div v-if="chatStore.leftPartIsDiscussion" v-for="(discussion, index) in chatStore.userDiscussions" :key="discussion.user.id" class="w-full h-[70px] sm:h-[calc(100%_/_6)]">
							<discussion-list @click.right.prevent="setDisplayDelete(index)" @click.left="chatStore.loadDiscussion(discussion), scrollToTop()" :discussion="discussion" :index="index"></discussion-list>
						</div>
						<div v-else v-for="(channel, index) in chatStore.userChannels" :key="channel.name" class="relative h-[70px] sm:h-[calc(100%_/_6)]">
							<channels-list
								v-if="memberInChannel(channel)"
								@click.right.prevent="setDisplayDelete(index)"
								@click.left="chatStore.loadChannel(channel), scrollToTop()"
								:channel="channel"
								:index="index"
							></channels-list>
							<button-delete v-if="displayDelete[index]" @close="unsetDisplayDelete(index)" :index="index" :isChannel="true"></button-delete>
						</div>
					</div>
					<div class="flex self-start items-center gap-4 ml-2 pt-3">
						<button-plus @click="chatStore.setRightPartToDisplay(null)"></button-plus>
						<label class="text-slate-700">{{ addButton() }}</label>
					</div>
				</div>
			</card-left>
			<card-right :title="chatStore.cardRightTitle">
				<div v-if="chatStore.displayChat" class="w-11/12 px-8 3xl:px-10 h-full">
					<div v-if="chatStore.inDiscussion || chatStore.inChannel" class="h-full">
						<chat></chat>
					</div>
					<div v-else class="shrink-0 flex justify-center items-center h-full w-full">
						<img   class="w-[90%]" src="@/assets/42.png" />
					</div>
				</div>
				<settings-channel v-else-if="chatStore.displayChannelSettings"></settings-channel>
				<channel-add v-else-if="chatStore.displayAddChannel"></channel-add>
				<discussion-add v-else-if="chatStore.displayAddDiscussion"></discussion-add>
				<channel-password-query v-else-if="chatStore.displayPasswordQuery"></channel-password-query>
			</card-right>
		</div>
	</base-ui>
</template>

<style>
#scrollbar::-webkit-scrollbar-track
{
	-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
	box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
	background-color: transparent;
	background-clip: content-box; 
}

#scrollbar::-webkit-scrollbar
{
	width: 5px;
	background-color: transparent;
}

#scrollbar::-webkit-scrollbar-thumb
{
	background-color: #334155;
}
</style>