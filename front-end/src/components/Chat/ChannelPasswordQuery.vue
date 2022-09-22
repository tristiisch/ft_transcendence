<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '@/stores/chatStore';
import { useGlobalStore } from '@/stores/globalStore';
import socket from '@/plugin/socketInstance';
import type Channel from '@/types/Channel';

const chatStore = useChatStore();
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
				chatStore.joinNewChannel(channelToJoin)
			}
			else {
				passwordError.value = true
				password.value = ''
			}
			globalStore.resetSelectedItems();
		});
	}
}
</script>

<template>
    <div class="flex flex-col justify-center items-center gap-2 rounded h-full">
        <p class="text-red-200 pb-4">This channel is <span class="text-red-800">PROTECTED</span></p>
        <form @submit.prevent="checkPassword()">
            <input v-model="password" placeholder="Enter password" class="text-sm w-full p-2 text-center bg-neutral-100 border border-blue-600 rounded-lg text-blue-600 placeholder:text-slate-300 placeholder:text-center">
        </form>
        <p v-if="passwordError && password === ''" class="flex gap-3 text-red-700 pt-4"><span class="-hue-rotate-[50deg]">⚠️</span>wrong password</p>
    </div>
</template>