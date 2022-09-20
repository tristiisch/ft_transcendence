<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';
import { useGlobalStore } from '@/stores/globalStore';
import { onUpdated } from 'vue';
import type Message from '@/types/Message';
import BaseButton from '@/components/Ui/BaseButton.vue';

const globalStore = useGlobalStore();
const chatStore = useChatStore();
const userStore = useUserStore();

const emit = defineEmits<{
	(e: 'scroll'): void
}>();

function redirectTo(idSender: number) {
	let playerId: number = -1;
	if (userStore.userData.id === idSender)
		playerId = userStore.userData.id
	else if (chatStore.inChannel) {
		const user = chatStore.inChannel.users.find(user => user.id === idSender)
		if (user)
			playerId = user.id;
	}
	else if (chatStore.inDiscussion)
		playerId = chatStore.inDiscussion.user.id;
	if (playerId !== -1)
		return { name: 'Profile', params: { id: playerId }}
}

function isUserMessage(idSender: number) {
	if (idSender === -1)
		return false
	return true;
}

function sizeText(idSender: number) {
	if (isUserMessage(idSender))
		return 'text-sm'
	else 
		return 'text-xs mb-2'
}

function displayMessage(message: Message) {
	chatStore.markMessageReaded(message);
	return message.message;
}

onUpdated(()=> {
    emit('scroll')
});

function colorMessage(message: Message) { return (message.send || message.idSender === -1) ? 'text-red-200' : 'text-red-600'}

function chooseArray() {
	if (chatStore.inChannel)
		return chatStore.inChannel.messages;
	else if (chatStore.inDiscussion)
		return chatStore.inDiscussion.messages;
};

function userAvatar(idSender: number) {
	if (idSender === userStore.userData.id)
		return userStore.userData.avatar;
	else if (chatStore.inChannel)
		return chatStore.inChannel.users.find(user => user.id === idSender)?.avatar
	else if (chatStore.inDiscussion)
		return chatStore.inDiscussion.user.avatar
}

function userName(idSender: number) {
	if (idSender === userStore.userData.id)
		return userStore.userData.username;
	else if (chatStore.inChannel)
		return chatStore.inChannel.users.find(user => user.id === idSender)?.username
	else if (chatStore.inDiscussion)
		return chatStore.inDiscussion.user.username
}
</script>

<template>
    <div v-for="message in chooseArray()" :key="message.idMessage" class="flex gap-2 w-full mb-4 pl-8">
		<BaseButton v-if="isUserMessage(message.idSender)" link :to="redirectTo(message.idSender)" class="shrink-0">
			<img class="self-center h-8 w-8 shrink-0 rounded-full border-[1px] border-red-400 sm:self-start" :src="userAvatar(message.idSender)">
		</BaseButton>
		<div class="flex flex-col gap-1 min-w-0">
			<div class="flex flex-col sm:items-center sm:gap-2 pt-1 sm:flex-row text-red-300">
				<p class="text-sm">{{ userName(message.idSender) }}</p>
				<p class="text-xs">{{ message.date }}</p>
			</div> 
			<div v-if="message.type !== 'game'" :class="sizeText(message.idSender), colorMessage(message)" class="min-w-0 text-red-200 break-words">{{ displayMessage(message) }}</div>
			<div v-else class="bg-red-600 w-full h-[20px]">{{ displayMessage(message) }}</div>
		</div>
    </div>
</template>