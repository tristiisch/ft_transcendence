<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { useToast } from 'vue-toastification';
import { ref, onBeforeMount, computed } from 'vue';
import UserService from '@/services/UserService';
import type User from '@/types/User';
import type Channel from '@/types/Channel';
import ChannelStatus from '@/types/ChannelStatus';
import CardLeft from '@/components/CardLeft.vue';
import CardRight from '@/components/CardRight.vue';
import ChannelsList from '@/components/Chat/ChannelsList.vue';
import AddChannel from '@/components/Chat/AddChannel.vue';
import ButtonPlus from '@/components/Chat/ButtonPlus.vue';
import ButtonDelete from '@/components/Chat/ButtonDelete.vue';
import AddSearchPlayer from '@/components/Chat/AddSearchPlayer.vue';
import ChannelPasswordQuery from '@/components/Chat/ChannelPasswordQuery.vue';
import ChannelSettings from '@/components/Chat/ChannelSettings/ChannelSettings.vue';
import PlayerDiscussion from '@/components/Chat/PlayerDiscussion.vue';
import ChatPart from '@/components/Chat/ChatPart.vue';
import type Discussion from '@/types/Discussion';
import { useRoute } from 'vue-router';

const route = useRoute();
const toast = useToast();
const userStore = useUserStore();
const discussions = ref<Discussion[] | null>(null);
const channels = ref<Channel[] | null>(null);
const leftPartToDisplay = ref('discussions');
const rightCardTitle = ref('CHAT');
const rightPartToDisplay = ref('chat');
const inDiscussion = ref<Discussion | null>(null);
const inChannel = ref<Channel | null>(null);
const rightClick = ref([] as boolean[]);
const isRegistered = ref(false);
const error = ref('');

//socket.auth = [userStore.userData.username];
//socket.connect();

function showFriends() {
	if (leftPartToDisplay.value != 'discussions') leftPartToDisplay.value = 'discussions';
	if (rightPartToDisplay.value != 'chat') rightPartToDisplay.value = 'chat';
	setRightCardTitle(rightPartToDisplay.value);
}

function showChannels() {
	if (leftPartToDisplay.value != 'channels') leftPartToDisplay.value = 'channels';
	if (rightPartToDisplay.value != 'chat') rightPartToDisplay.value = 'chat';
	setRightCardTitle(rightPartToDisplay.value);
}

function fetchDiscussions() {
	UserService.getDiscussion(userStore.userData.id)
		.then((response) => {
			discussions.value = response.data;
			if (route.query.discussion) {
				if(discussions.value)
				{
					const discussion = discussions.value.find((discussion: Discussion) => discussion.user.id === parseInt(route.query.discussion as string))
					if (discussion)
						loadDiscussion(discussion)
					else
						invitePlayer()
				}
            }
		})
		.catch((e) => {
			error.value = e.response.data.message
			toast.error(error.value);
		});
}

function fetchChannels() {
	UserService.getChannels()
		.then((response) => {
			channels.value = response.data;
		})
		.catch((e) => {
			error.value = e.response.data.message
			toast.error(error.value);
		});
}

function setRightCardTitle(displayPart: string) {
	if (displayPart === 'chat') rightCardTitle.value = 'CHAT';
	else if (displayPart === 'addDiscussion') rightCardTitle.value = 'DISCUSSION';
	else if (displayPart === 'channelSettings') rightCardTitle.value = 'SETTINGS';
	else rightCardTitle.value = 'CHANNEL';
}

function setPartToDisplay(name: string | null) {
	if (name) {
		rightPartToDisplay.value = name;
	} else {
		if (leftPartToDisplay.value === 'discussions') rightPartToDisplay.value = 'addDiscussion';
		else if (leftPartToDisplay.value === 'channels') rightPartToDisplay.value = 'createChannel';
		else rightPartToDisplay.value = 'chat';
	}
	setRightCardTitle(rightPartToDisplay.value);
}

function invitePlayer() {
	setRightCardTitle('chat');
	rightPartToDisplay.value = 'chat';
}

function addButtonText() {
	if (leftPartToDisplay.value === 'discussions') return 'Add discussion';
	else return 'Add channel';
}

function loadDiscussion(discussion: Discussion) {
	if (inChannel.value) inChannel.value = null;
	inDiscussion.value = discussion;
	rightPartToDisplay.value = 'chat';
}

function loadChannel(channel: Channel) {
	if (inDiscussion.value) inDiscussion.value = null;
	inChannel.value = channel;
	rightPartToDisplay.value = 'chat';
	if (inChannel.value.type === ChannelStatus.PROTECTED) {
		for (const user of inChannel.value.users)
			if (user.id === userStore.userData.id)
				isRegistered.value = true;
	}
}

function deleteChannelDiscussion(index: number) {
	// let index = channels.value.findIndex(channel)
	// channels.value.splice(index, 1)
	console.log('yo');
}

const isLoading = computed(() => {
	if ((discussions.value && channels.value) || error.value !== '') return false;
	return true;
});

function registration() { 
	isRegistered.value = true 

}

onBeforeMount(() => {
	fetchChannels();
	fetchDiscussions();
});

// onbeforeunload = () => {
// 	socket.emit("leave", username);
// 	};
</script>

<template>
	<base-ui :isLoading="isLoading">
		<div class="flex flex-col h-full sm:flex-row">
			<card-left>
				<div class="flex flex-col justify-between items-center h-full px-8">
					<div class="flex w-full justify-around gap-2 flex-wrap sm:pb-5 sm:border-b-[1px] sm:border-slate-700">
						<button @click="showFriends" class="font-Arlon tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">DISCUSSIONS</button>
						<button @click="showChannels" class="font-Arlon tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">CHANNELS</button>
					</div>
					<div class="flex flex-col justify-between h-full w-full">
						<div class="overflow-x-auto sm:overflow-y-auto h-[60px] sm:h-[300px] w-full">
							<div v-if="leftPartToDisplay === 'discussions'" v-for="(discussion, index) in discussions" :key="discussion.user.id" class="relative">
								<player-discussion @click.right="rightClick[index] = !rightClick[index]" @click.left="loadDiscussion(discussion)" :discussion="discussion"></player-discussion>
								<button-delete v-if="rightClick[index]" @delete="deleteChannelDiscussion(index)" @close="rightClick[index] = !rightClick[index]"></button-delete>
							</div>
							<div v-else v-for="(channel, index) in channels" :key="channel.name" class="relative">
								<channels-list @click.right="rightClick[index] = !rightClick[index]" @click.left="loadChannel(channel)" :channel="channel"></channels-list>
								<button-delete v-if="rightClick[index]" @delete="deleteChannelDiscussion(index)" @close="rightClick[index] = !rightClick[index]"></button-delete>
							</div>
						</div>
						<div class="flex self-start items-center gap-4 ml-2">
							<button-plus @click="setPartToDisplay(null)"></button-plus>
							<label class="text-slate-700">{{ addButtonText() }}</label>
						</div>
					</div>
				</div>
			</card-left>
			<card-right :title="rightCardTitle">
				<div v-if="rightPartToDisplay === 'chat'" class="w-11/12 px-8 3xl:px-10 h-full">
					<div v-if="inDiscussion || inChannel" class="h-full">
						<ChannelPasswordQuery v-if="inChannel && inChannel.type === ChannelStatus.PROTECTED && !isRegistered" @registered="registration()" :inChannel="inChannel"></ChannelPasswordQuery>
						<chat-part v-else @channelSettings="setPartToDisplay('channelSettings')" :inDiscussion="inDiscussion" :inChannel="inChannel"></chat-part>
					</div>
					<img v-else class="flex justify-center items-center h-full" src="@/assets/42.png" />
				</div>
				<channel-settings v-else-if="rightPartToDisplay === 'channelSettings' && inChannel" @return="setPartToDisplay('chat')" @validate="invitePlayer" :inChannel="inChannel"></channel-settings>
				<AddSearchPlayer v-else-if="rightPartToDisplay === 'addDiscussion'" @close="setPartToDisplay('chat')" @validate="invitePlayer" :singleSelection="true"></AddSearchPlayer>
				<add-channel v-else-if="rightPartToDisplay === 'createChannel'" @close="setPartToDisplay('chat')" @validate="invitePlayer"></add-channel>
			</card-right>
		</div>
	</base-ui>
</template>
