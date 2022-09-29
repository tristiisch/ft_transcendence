<script setup lang="ts">
import { ref, watch } from 'vue'
import { useChatStore } from '@/stores/chatStore';
import { useGlobalStore } from '@/stores/globalStore';
import { useUserStore } from '@/stores/userStore';
import socket from '@/plugin/socketInstance';
import type Channel from '@/types/Channel';
import ButtonReturnNext from '@/components/Button/ButtonReturnNext.vue';
import PartToDisplay from '@/types/ChatPartToDisplay';

const chatStore = useChatStore();
const userStore = useUserStore();
const globalStore = useGlobalStore();
const password = ref('')
const passwordError = ref(false);

function checkPassword()
{
	let channelToJoin: Channel;
	if (!globalStore.isTypeUser(globalStore.selectedItems[0])) {
		channelToJoin = globalStore.selectedItems[0];
		socket.emit('chatPassCheck', channelToJoin, password.value, (ok: boolean) => {
			if (ok) {
				chatStore.joinNewChannel(channelToJoin, password.value);
				if (channelToJoin.banned.find(user => user.id === userStore.userData.id))
					chatStore.setRightPartToDisplay(PartToDisplay.CHAT);
				globalStore.resetSelectedItems();
			}
			else {
				passwordError.value = true;
				password.value = '';
			}
		});
	}
}

function leavePage() {
	chatStore.setRightPartToDisplay(PartToDisplay.CHAT)
	globalStore.resetSelectedItems();
}
</script>

<template>
    <div class="flex flex-col w-full justify-center items-center gap-2 rounded h-full px-10">
		<div class="flex flex-col justify-center h-full">
			<p class="text-red-200 pb-4">This channel is <span class="text-red-800">PROTECTED</span></p>
			<div class="flex w-full justify-center items-center" >
				<form @submit.prevent="checkPassword()">
					<input v-model="password" placeholder="Enter password" class="text-sm w-full p-2 text-center bg-neutral-100 border border-blue-600 rounded-l-lg text-blue-600 placeholder:text-slate-300 placeholder:text-center">
				</form>
				<button @click="checkPassword()" type="submit" class="p-2.5 text-sm font-medium text-white border border-t border-b border-r border-slate-600 bg-slate-700 rounded-r-lg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F5F5F5" class="w-4 h-4">
					<path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
				</button>
			</div>
			<p v-if="passwordError && password === ''" class="flex gap-3 text-red-700 pt-4"><span class="-hue-rotate-[50deg]">⚠️</span>wrong password</p>
		</div>
		<button-return-next @click="leavePage()" side="previous" class="self-end mb-1"></button-return-next>
	</div>
</template>