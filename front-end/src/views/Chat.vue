<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { useChatStore } from '@/stores/chatStore';
import { useGlobalStore } from '@/stores/globalStore';
import { useToast } from 'vue-toastification';
import { ref, onBeforeMount, computed } from 'vue';
import { useRoute } from 'vue-router';
import type Channel from '@/types/Channel';
import PartToDisplay from '@/types/ChatPartToDisplay';
import type Discussion from '@/types/Discussion';
import ChatStatus from '@/types/ChatStatus';
import ChannelsList from '@/components/Chat/ChannelsList.vue';
import ChannelAdd from '@/components/Chat/AddChannel/ChannelAdd.vue';
import DiscussionAdd from '@/components/Chat/DiscussionAdd.vue';
import ButtonPlus from '@/components/Button/ButtonPlus.vue';
import ButtonDelete from '@/components/Button/ButtonDelete.vue';
import ChannelPasswordQuery from '@/components/Chat/ChannelPasswordQuery.vue';
import SettingsChannel from '@/components/Chat/ChannelSettings/SettingsChannel.vue';
import DiscussionList from '@/components/Chat/DiscussionList.vue';
import Chat from '@/components/Chat/ChatRoot.vue';

const toast = useToast();
const userStore = useUserStore();
const globalStore = useGlobalStore();
const chatStore = useChatStore();
const route = useRoute();
const displayDelete = ref([] as boolean[]);
const error = ref('');

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

const isLoading = computed(() => {
	if ((chatStore.userDiscussions && chatStore.userChannels) || error.value !== '') return false;
	return true;
});

onBeforeMount(() => {
	globalStore.fetchChannels().catch((e: Error) => {
		error.value = e.message;
		toast.error(error.value);
	});
	chatStore.fetchUserChannels().catch((e: Error) => {
		error.value = e.message;
		toast.error(error.value);
	});
	chatStore.fetchUserDiscussions()
		.then(() => {
			if (route.query.discussion) {
				const discussion = chatStore.userDiscussions.find((discussion: Discussion) => discussion.user.id === parseInt(route.query.discussion as string));
				if (discussion) chatStore.loadDiscussion(discussion);
				else {
					const user = globalStore.getUser(parseInt(route.query.discussion as string));
					if (user) chatStore.addNewDiscussion();
				}
			}
		})
		.catch((e: Error) => {
			error.value = e.message;
			toast.error(error.value);
	});
});
</script>

<template>
	<base-ui :isLoading="chatStore.isLoading">
		<div class="flex flex-col h-full sm:flex-row">
			<card-left>
				<div class="flex flex-col justify-between items-center h-full px-8">
					<div class="flex w-full justify-around gap-2 flex-wrap sm:pb-5 sm:border-b-[1px] sm:border-slate-700">
						<button
							@click="chatStore.setLeftPartToDisplay('discussion')"
							class="font-Arlon tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500"
						>
							DISCUSSIONS
						</button>
						<button
							@click="chatStore.setLeftPartToDisplay('channels')"
							class="font-Arlon tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500"
						>
							CHANNELS
						</button>
					</div>
					<div class="flex flex-col justify-between h-full w-full">
						<div class="overflow-x-auto sm:overflow-y-auto h-[60px] sm:h-[300px] w-full">
							<div v-if="chatStore.leftPartIsDiscussion" v-for="(discussion, index) in chatStore.userDiscussions" :key="discussion.user.id" class="relative">
								<discussion-list @click.right="setDisplayDelete(index)" @click.left="chatStore.loadDiscussion(discussion)" :discussion="discussion" :index="index"></discussion-list>
								<button-delete v-if="displayDelete[index]" @close="unsetDisplayDelete(index)" :index="index" :isChannel="false"></button-delete>
							</div>
							<div v-else v-for="(channel, index) in chatStore.userChannels" :key="channel.name" class="relative">
								<channels-list
									v-if="memberInChannel(channel)"
									@click.right="setDisplayDelete(index)"
									@click.left="chatStore.loadChannel(channel)"
									:channel="channel"
									:index="index"
								></channels-list>
								<button-delete v-if="displayDelete[index]" @close="unsetDisplayDelete(index)" :index="index" :isChannel="true"></button-delete>
							</div>
						</div>
						<div class="flex self-start items-center gap-4 ml-2">
							<button-plus @click="chatStore.setRightPartToDisplay(null)"></button-plus>
							<label class="text-slate-700">{{ addButton() }}</label>
						</div>
					</div>
				</div>
			</card-left>
			<card-right :title="chatStore.cardRightTitle">
				<div v-if="chatStore.displayChat" class="w-11/12 px-8 3xl:px-10 h-full">
					<div v-if="chatStore.inDiscussion || chatStore.inChannel" class="h-full">
						<channel-password-query v-if="chatStore.isProtectedChannel"></channel-password-query>
						<chat v-else></chat>
					</div>
					<img v-else class="flex justify-center items-center h-full" src="@/assets/42.png" />
				</div>
				<settings-channel v-else-if="chatStore.displayChannelSettings"></settings-channel>
				<channel-add v-else-if="chatStore.displayAddChannel"></channel-add>
				<discussion-add v-else-if="chatStore.displayAddDiscussion"></discussion-add>
			</card-right>
		</div>
	</base-ui>
</template>
