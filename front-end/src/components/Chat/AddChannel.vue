<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import CreateChannel from '@/components/Chat/CreateChannel.vue';
import ButtonReturnNext from '@/components/Chat/ButtonReturnNext.vue';
import PartToDisplay from '@/types/ChatPartToDisplay';
import { useToast } from 'vue-toastification';
import { ref } from 'vue'
import JoinChannel from '@/components/Chat//JoinChannel.vue'

const toast = useToast();
const chatStore = useChatStore();
// const channelsList = ref<Channel[]>(chatStore.channels)
const error = ref('');
const displayCreateChannel = ref(false);
const displayJoinChannel = ref(false);

function displayButton() {
	return !displayCreateChannel.value && !displayJoinChannel.value
}

function resetDisplay() {
	if (displayCreateChannel.value)
		displayCreateChannel.value = false
	else (displayJoinChannel.value)
		displayJoinChannel.value = false
}

</script>

<template>
	<div class="flex flex-col justify-between items-center h-full w-full px-6 3xl:px-10">
		<div v-if="displayButton()" class="flex flex-col gap-2 justify-center items-center h-full w-full">
			<button @click="displayCreateChannel = !displayCreateChannel" class="py-2 w-1/2 text-xs text-blue-600 bg-neutral-100 rounded-md border border-blue-600 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
				Create
			</button>
			<button @click="displayJoinChannel = !displayJoinChannel" class="py-2 w-1/2 text-xs text-blue-600 bg-neutral-100 rounded-md border border-blue-600 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
				Join
			</button>
		</div>
		<button-return-next v-if="displayButton()" :side="'previous'" @click="chatStore.setRightPartToDisplay(PartToDisplay.CHAT)" class="self-end"></button-return-next>
		<create-channel v-if="displayCreateChannel" @close="resetDisplay()"></create-channel>
		<join-channel v-else-if="displayJoinChannel" @close="resetDisplay()"></join-channel>
	</div>
</template>