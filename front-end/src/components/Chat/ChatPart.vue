<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import type Message from '@/types/Message';
import type Channel from '@/types/Channel';
import ChatTopImage from '@/components/Chat/ChatTopImage.vue';
import message from '@/components/Chat/Message.vue';
import socket from '@/plugin/socketInstance';
import type User from '@/types/User';
import { onBeforeMount, watch, ref } from 'vue';
import type Discussion from '@/types/Discussion';

const userStore = useUserStore();
const scroll = ref<HTMLInputElement | null>(null);
const newMessage = ref('');
const messages = ref<Message[]>([])

const props = defineProps<{
	inDiscussion: Discussion | null
	inChannel: Channel | null
	users: User[]
}>()

const emit = defineEmits<{
	(e: 'channelSettings'): void,
}>()

function sendMessage() {
	if (newMessage.value != '')
	{
		const now = (new Date()).toLocaleString();
		messages.value.push({
			date: now,
			message: newMessage.value,
			idSender: userStore.userData.id
		});
		socket.emit('chat-message', {
			date: now,
			message: newMessage.value,
			id: userStore.userData.id
		});
		newMessage.value = '';
		scrollToEnd();
	}
}

socket.on('chat-message', (data) => {
	console.log(data.sender);
	messages.value.push({
		idMessage: -1,
		idChat: -1,
		date: data.date,
		message: data.message,
		idSender: data.id,
	});
	console.log(data);
	console.log(messages.value);
});

function scrollToEnd() {
	if (scroll.value) {
		scroll.value.scrollTop = scroll.value.scrollHeight;
	}
}

onBeforeMount(() => {
	if (props.inDiscussion)
		messages.value = props.inDiscussion.messages
	else if (props.inChannel)
		messages.value = props.inChannel.messages
});

watch(() => props.inDiscussion, () => {
	if (props.inDiscussion)
		messages.value = props.inDiscussion.messages
});

watch(() => props.inChannel, () => {
	if (props.inChannel)
		messages.value = props.inChannel.messages
});

</script>

<template>
    <div class="flex flex-col justify-between h-full">
        <ChatTopImage :inDiscussion="inDiscussion" :inChannel="inChannel"></ChatTopImage>
        <div class="flex flex-col w-full h-[calc(100%_-_36px)] overflow-y-auto" ref="scroll">
            <message @scroll="scrollToEnd" :messages="messages" :inDiscussion="inDiscussion" :inChannel="inChannel" :users="users"></message>
        </div>
        <div class="w-full flex justify-between gap-3">
            <form @submit.prevent="sendMessage()" class="w-full">
                <input v-model="newMessage" class="text-sm w-full p-2 bg-gray-700 rounded-lg text-white" />
            </form>
            <button v-if="inDiscussion" class="bg-lime-400 rounded-lg px-2">
                <img src="@/assets/inGame.png" class="w-10" />
            </button>
            <button v-if="inChannel" @click="emit('channelSettings')">
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