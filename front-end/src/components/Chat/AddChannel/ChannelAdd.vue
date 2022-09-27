<script setup lang="ts">
import { useToast } from 'vue-toastification';
import { useGlobalStore } from '@/stores/globalStore';
import { ref } from 'vue'
import PartToDisplay from '@/types/ChatPartToDisplay';
import { useChatStore } from '@/stores/chatStore';
import ChannelJoin from '@/components/Chat/AddChannel/ChannelJoin.vue'
import ChannelCreate from '@/components/Chat/AddChannel/ChannelCreate.vue';
import ButtonReturnNext from '@/components/Button/ButtonReturnNext.vue';

const toast = useToast();
const chatStore = useChatStore();
const globalStore = useGlobalStore();
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
	if (globalStore.selectedItems.length)
		globalStore.resetSelectedItems();
}

</script>

<template>
	<div class="flex flex-col justify-between items-center h-full w-full px-8 3xl:px-10">
		<div v-if="displayButton()" class="flex flex-col gap-2 justify-center items-center h-full w-full">
			<button @click="displayCreateChannel = !displayCreateChannel" class="py-2 w-1/2 text-xs text-blue-600 bg-neutral-100 rounded-md border border-blue-600 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
				Create
			</button>
			<button @click="displayJoinChannel = !displayJoinChannel" class="py-2 w-1/2 text-xs text-blue-600 bg-neutral-100 rounded-md border border-blue-600 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
				Join
			</button>
		</div>
		<button-return-next v-if="displayButton()" :side="'previous'" @click="chatStore.setRightPartToDisplay(PartToDisplay.CHAT)" class="self-end"></button-return-next>
		<channel-create v-if="displayCreateChannel" @close="resetDisplay()"></channel-create>
		<channel-join v-else-if="displayJoinChannel" @close="resetDisplay()"></channel-join>
	</div>
</template>