<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';
import { useGlobalStore } from '@/stores/globalStore';
import { onUpdated } from 'vue';
import { useToast } from 'vue-toastification';
import { useRouter, useRoute } from 'vue-router';
import type Message from '@/types/Message';
import BaseButton from '@/components/Ui/BaseButton.vue';
import MessageType from '@/types/MessageType';
import socket from '@/plugin/socketInstance';
import UserService from '@/services/UserService';

const globalStore = useGlobalStore();
const chatStore = useChatStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

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

function acceptInvitation(message: Message) {
	const notifId =globalStore.getNotifGameByUserID(message.idSender)
	if (notifId) {
		UserService.notificationAction(notifId, true)
			.then((response) => {
				globalStore.removeNotification(notifId)
				message.canUseButton = false
				router.push({ name: 'Match', params: { uuid: response?.data.id } });
			})
			.catch((error) => {
				if (error.response.status === 406)
				{
					toast.warning(error.response.data.message)
				}
				else router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
			})
	}
}

function declineInvitation(message: Message) {
	const notifId =globalStore.getNotifGameByUserID(message.idSender)
	if (notifId) {
		UserService.notificationAction(notifId, false)
			.then(() => {
				globalStore.removeNotification(notifId)
				message.canUseButton = false
			})
			.catch((error) => {
				if (error.response.status === 406)
				{
					toast.warning(error.response.data.message)
				}
				else router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
			})
	}
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
				<p class="text-xxs pt-1">{{ message.date.toLocaleString() }}</p>
			</div> 
			<div v-if="message.type !== MessageType.GAME_INVITATION" :class="sizeText(message.type), colorMessage(message)" class="min-w-0 text-red-200 break-words"> {{ displayMessage(message) }} </div>
			<div v-else class="flex items-center gap-2 bg-neutral-100 border-[1px] border-blue-600 w-full h-[42px] sm:h-[52px] rounded-lg pl-1">
				<img class="h-8 w-8 sm:h-11 sm:w-11 shrink-0 rounded-full border-[1px] border-pink-400 object-cover" src='@/assets/invitationGame.jpg'>
				<div class="flex flex-col justify-center items-center gap-1" >
					<div class="pr-4 text-xs sm:text-xs text-blue-600"> {{ displayMessage(message) }} </div>
					<svg v-if="message.idSender === userStore.userData.id && message.canUseButton" class="w-3 h-3 sm:w-6 sm:h-6 text-neutral-300 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
						<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
					</svg>
					<div v-if="message.idSender !== userStore.userData.id && message.canUseButton" class="flex gap-1 pr-5">
						<button @click="acceptInvitation(message)" class="bg-blue-600 text-neutral-100 p-1">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-2 w-2" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
						</button>
						<button @click="declineInvitation(message)" class="bg-red-600 text-neutral-100 p-1">
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