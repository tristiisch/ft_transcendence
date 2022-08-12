<script setup lang="ts">
import InChatTopImage from '@/components/Chat/InChatTopImage.vue'
import ButtonCloseValidate from '@/components/Chat/ButtonCloseValidate.vue'
import type Channel from '@/types/Channel';
import status from '@/types/ChannelStatus';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();

defineProps<{
	inChannel: Channel | null;
}>();

const emit = defineEmits<{
	(e: 'close'): void,
	(e: 'validate'): void
}>()

function labelText(channel: Channel) {
	if (channel.type === status.PROTECTED)
		return 'Choose new password'
	else
		return 'you can set a password'
}

function statusText(channel: Channel)
{
	if ( ) 
}

</script>

<template>
	<InChat-TopImage :inChannel="inChannel"></InChat-TopImage>
	<div>your current channel status is {{ statusText(inChannel) }}</div>
	<div class="inline-flex shadow-sm w-full">
		<button class="w-1/3 py-2 px-4 text-xs font-medium text-gray-800 bg-red-100 rounded-l-lg border border-red-200 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
			Password
		</button>
		<button class="w-1/3 py-2 px-4 text-xs font-medium text-gray-800 bg-red-100 border-t border-b border-red-200 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
			Administrator
		</button>
		<button class="w-1/3 py-2 px-4 text-xs font-medium text-gray-800 bg-red-100 rounded-r-md border border-red-200 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
			Mute/Ban
		</button>
	</div>
	<div v-if="inChannel && inChannel.owner === userStore.userData.username" class="flex flex-col justify-center items-center gap-6 h-full w-full">
		<div class="mb-2 w-full sm:w-3/4">
			<label class="block mb-2 text-sm font-medium text-red-200">Change channel name:</label>
			<input type="text" class="bg-red-100 border border-red-500 placeholder:text-gray-400 text-sm rounded-lg focus:ring-blue-500 focus:border-red-600 block w-full p-2" placeholder="choose name">
		</div>
		<div class="mb-2 w-full sm:w-3/4">
			<label class="block mb-2 text-sm font-medium text-red-200">{{ labelText(inChannel) }}</label>
			<input type="text" class="bg-red-100 border border-red-500 placeholder:text-gray-400 text-sm rounded-lg focus:ring-blue-500 focus:border-red-600 block w-full p-2" placeholder="choose password">
		</div>
	</div>
	
	<div class="overflow-y-auto h-full w-full">
		<div v-for="user in inChannel?.users" :key="user.id" class="flex justify-between items-center h-[calc(100%_/_4) border-b-[1px] w-full border-red-400">
			<div class="inline-flex items-center py-4">
				<img class="shrink-0 w-12 h-12 rounded-full object-cover border-t-[1px] border-zinc-300" :src="user.avatar" alt="Rounded avatar">
				<p class="px-4 text-sm">{{ user.username }}</p>
			</div>
			<svg class="h-10 w-10 mr-6 w-full">
				<circle cx="20" cy="20" r="8"  fill="none" stroke="#f87171" stroke-width="1" />
			</svg>
		</div>
	</div>
	<Button-CloseValidate @validate="emit('validate')" @close="emit('close')"></Button-CloseValidate>
</template>