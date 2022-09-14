<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import { useGlobalStore } from '@/stores/globalStore';
import { onUpdated } from 'vue';
import BaseButton from '@/components/Ui/BaseButton.vue';

const globalStore = useGlobalStore();
const chatStore = useChatStore();

const emit = defineEmits<{
	(e: 'scroll'): void
}>();

function redirectTo(senderId: number) {
	const playerId = globalStore.getUserId(senderId)
	if(playerId) 
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

onUpdated(()=> {
    emit('scroll')
});

function chooseArray() {
	if (chatStore.inChannel)
		return chatStore.inChannel.messages;
	else if (chatStore.inDiscussion)
		return chatStore.inDiscussion.messages;
};
</script>

<template>
    <div v-for="message in chooseArray()" :key="message.idMessage" class="flex gap-2 w-full mb-4 pl-8">
		<BaseButton v-if="isUserMessage(message.idSender)" link :to="redirectTo(message.idSender)" class="shrink-0">
			<img class="self-center h-8 w-8 shrink-0 rounded-full border-[1px] border-red-400 sm:self-start" :src="globalStore.getUserAvatar(message.idSender)">
		</BaseButton>
		<div class="flex flex-col gap-1 min-w-0">
			<div class="flex flex-col sm:items-center sm:gap-2 pt-1 text-red-300 sm:flex-row">
				<p class="text-sm ">{{ globalStore.getUserName(message.idSender) }}</p>
				<p class="text-xs">{{ message.date }}</p>
			</div> 
			<div v-if="message.type !== 'game'" :class="sizeText(message.idSender)" class="min-w-0 text-red-200 break-words">{{ message.message,  message.read = true }}</div>
			<div v-else class="bg-red-600 w-full h-[20px]">{{ message.message, message.read = true}} </div>
		</div>
    </div>
</template>