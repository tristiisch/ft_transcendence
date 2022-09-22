<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';

const chatStore = useChatStore();
const userStore = useUserStore();

const props = defineProps<{ index: number; isChannel: boolean}>();

const emit = defineEmits<{
	(event: 'close'): void;
}>();

function deleteChannelDiscussion(index: number)
{
    if (props.isChannel) {
        chatStore.leaveChannel(chatStore.userChannels[index], userStore.userData)
        emit('close')
    }
    else {
        chatStore.deleteUserDiscussion(index)
        emit('close')
    }
}
</script>

<template>
    <div class="absolute top-[6px] z-10 w-full h-[90%] flex justify-center bg-blue-600 text-white text-sm">
        <button @click="deleteChannelDiscussion(index)" class="w-full">
            Delete
        </button>
        <button @click="emit('close')" class="inline-flex justify-center items-center bg-blue-700 rounded-sm h-4 w-4 mr-2 mt-2">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
        </button>
    </div>
</template>