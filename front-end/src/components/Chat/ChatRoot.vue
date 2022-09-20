<script setup lang="ts">
import { onMounted, onUpdated, ref, watch } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';
import PartToDisplay from '@/types/ChatPartToDisplay';
import UsersChannelsNameImage from '@/components/Chat/UsersChannelNameImages.vue';
import message from '@/components/Chat/ChatMessage.vue';

const userStore = useUserStore();
const chatStore = useChatStore();
const scroll = ref<HTMLInputElement | null>(null);
const newMessage = ref('');
const inputDisabled = ref(false);

function scrollToEnd() {
	if (scroll.value) {
		scroll.value.scrollTop = scroll.value.scrollHeight;
	}
}

function sendGameInvitation() {
    chatStore.sendMessage('game invitation', 'game');
}

function sendMessage() { 
	chatStore.sendMessage(newMessage.value)
	newMessage.value = ''
	scrollToEnd()
}

function haveRight() {
	if (chatStore.inChannel && chatStore.inChannel.muted) {
		const index = chatStore.inChannel.muted.findIndex(user => user.id === userStore.userData.id)
		if (index >= 0) {
			inputDisabled.value = true;
			return true
		}
	}
	inputDisabled.value = false;
	return false
}

onMounted(() => {
    scrollToEnd();
});
</script>

<template>
    <div class="flex flex-col justify-between h-full">
        <users-channels-name-image></users-channels-name-image>
        <div class="flex flex-col w-full h-[calc(100%_-_36px)] overflow-y-auto" ref="scroll">
            <message @scroll="scrollToEnd"></message>
        </div>
        <div class="w-full flex justify-between gap-3">
            <form @submit.prevent="sendMessage()" class="flex w-full">
                <input v-model="newMessage" :disabled="haveRight()"  :placeholder="inputDisabled ? 'you are MUTED' : ''" class="placeholder:text-slate-300 placeholder:text-center p-2 outline-none border border-slate-600 text-sm w-full bg-slate-700 rounded-l-lg text-white"/>
                <button type="submit" class="p-2.5 text-sm font-medium text-white border border-t border-b border-r border-slate-600 bg-slate-700 rounded-r-lg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f5f5f5" class="w-4 h-4">
  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
</svg>
</button>
            </form>
            <button v-if="chatStore.inDiscussion" class="bg-lime-400 rounded-lg px-2" @click="sendGameInvitation()">
                <img src="@/assets/inGame.png" class="w-10" />
            </button>
            <button v-if="chatStore.inChannel" @click="chatStore.setRightPartToDisplay(PartToDisplay.CHANNEL_SETTINGS)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="#F87171">
                    <path
                        fill-rule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clip-rule="evenodd"
                    />
                </svg>
            </button>
        </div>
    </div>
</template>