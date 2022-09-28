<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';
import { useGlobalStore } from '@/stores/globalStore';
import { useRouter } from 'vue-router';
import { onUpdated } from 'vue';
import type Message from '@/types/Message';
import BaseButton from '@/components/Ui/BaseButton.vue';
import MessageType from '@/types/MessageType';
import socket from '@/plugin/socketInstance';

const globalStore = useGlobalStore();
const chatStore = useChatStore();
const userStore = useUserStore();
const router = useRouter();

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

function isUserMessage(type: MessageType) {
	if (type === MessageType.AUTOMATIC_MESSAGE)
		return false
	return true;
}

function sizeText(type: MessageType) {
	if (type !== MessageType.AUTOMATIC_MESSAGE)
		return 'text-sm'
	else 
		return 'text-xs mb-2'
}

function displayMessage(message: Message) {
	chatStore.markMessageReaded(message);
	return message.message;
}

function acceptInvitation() {
	socket.emit("gameInvitation", true, (match_uuid: string) => {
		router.push({ name: 'Match', params: { uuid: match_uuid } })
	})
}

function declineInvitation() {
	socket.emit("gameInvitation", false);
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
</script>

<template>
    <div v-for="message in chooseArray()" :key="message.idMessage" class="flex gap-2 w-full mb-4 pl-8 pr-2">
		<BaseButton v-if="isUserMessage(message.type)" link :to="redirectTo(message.idSender)" class="shrink-0">
			<img class="self-center h-8 w-8 shrink-0 rounded-full object-cover border-[1px] border-red-400 sm:self-start" :src="message.avatarSender">
		</BaseButton>
		<div class="flex flex-col gap-1 min-w-0">
			<div class="flex flex-col sm:items-center sm:gap-2 pt-1 sm:flex-row text-red-300">
				<p class="text-xs sm:text-sm">{{ message.usernameSender }}</p>
				<p class="text-xxs pt-1">{{ message.date }}</p>
			</div> 
			<div v-if="message.type !== MessageType.GAME_INVITATION" :class="sizeText(message.type), colorMessage(message)" class="min-w-0 text-red-200 break-words"> {{ displayMessage(message) }} </div>
			<div v-else class="flex items-center gap-2 bg-neutral-100 border-[1px] border-blue-600 w-full h-[42px] sm:h-[52px] rounded-lg pl-1">
				<img class="h-8 w-8 sm:h-11 sm:w-11 shrink-0 rounded-full border-[1px] border-pink-400 object-cover" src='@/assets/invitationGame.jpg'>
				<div class="flex flex-col justify-center items-center gap-1" >
					<div class="pr-4 text-xs sm:text-xs text-blue-600"> {{ displayMessage(message) }} </div>
					<div v-if="message.idSender !== userStore.userData.id" class="flex gap-1 pr-5">
						<button @click="acceptInvitation()" class="bg-blue-600 text-neutral-100 p-1">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-2 w-2" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
						</button>
						<button @click="declineInvitation()" class="bg-red-600 text-neutral-100 p-1">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-2 w-2" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
    </div>
</template>