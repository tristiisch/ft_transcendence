<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import { onUpdated, onBeforeMount} from 'vue'
import BaseButton from '@/components/Ui/BaseButton.vue';


const chatStore = useChatStore();

const emit = defineEmits<{
	(e: 'scroll'): void
}>();

function redirectTo(senderId: number) {
	const playerId = chatStore.getPlayerId(senderId)
	if(playerId) 
		return { name: 'Profile', params: { id: playerId }}
}

onUpdated(()=> {
    emit('scroll')
});
</script>

<template>
    <div v-for="message in chatStore.messages" :key="message.date" class="flex gap-2 w-full mt-3 mb-1.5 pl-8">
		<BaseButton link :to="redirectTo(message.idSender)">
			<img class="self-center h-8 w-8 shrink-0 rounded-full border-[1px] border-red-400 sm:self-start" :src="chatStore.getPlayerAvatar(message.idSender)">
		</BaseButton>
		<div class="flex flex-col gap-1 min-w-0">
			<div class="flex flex-col sm:items-center sm:gap-2 pt-1 text-red-300 sm:flex-row">
				<p class="text-sm ">{{ chatStore.getPlayerName(message.idSender) }}</p>
				<p class="text-xs">{{ message.date }}</p>
			</div> 
			<div class="text-sm min-w-0 text-red-200 break-words">{{ message.message }}</div>
		</div>
    </div>
</template>