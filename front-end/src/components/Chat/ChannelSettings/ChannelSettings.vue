
<script setup lang="ts">
import InChatTopImage from '@/components/Chat/InChatTopImage.vue'
import ChannelPasswordName from '@/components/Chat/ChannelSettings/ChannelPasswordName.vue';
import ChannelAdmin from '@/components/Chat/ChannelSettings/ChannelAdmin.vue'
import type Channel from '@/types/Channel';
import { useUserStore } from '@/stores/userStore';
import { ref, computed } from 'vue';

const userStore = useUserStore();
const displayPasswordPage = ref(false);
const displayAdminPage = ref(false);
const displayMuteBanPage = ref(false);

defineProps<{
	inChannel: Channel;
}>();

const emit = defineEmits<{
	(e: 'close'): void,
	(e: 'validate'): void
}>()


function isOwner(channel: Channel) {
	if (channel.owner == userStore.userData.username)
		return true
}
function statusText(channel: Channel)
{
	if (isOwner(channel)) return 'OWNER'
	else 
	{
		let i = 0;
		while (i < channel.admin.length)
			if (channel.admin[i].username === userStore.userData.username)
				return 'ADMINISTRATOR'
		return 'MEMBER'
	}
}

function displayButton() {
	return !displayAdminPage.value && !displayMuteBanPage.value && !displayPasswordPage.value
}

function changeNamePassword()
{
	displayPasswordPage.value = !displayPasswordPage.value
}

</script>

<template>
	<div class="flex flex-col justify-between h-full">
		<InChatTopImage :inChatWith="null" :inChannel="inChannel"></InChatTopImage>
		<div v-if="displayButton()" class="flex flex-col justify-around h-full">
			<div class="flex flex-col justify-center items-center gap-6">
				<p class="text-red-200 text-center">your are <span class="text-red-800">{{ statusText(inChannel) }}</span> of this channel</p>
				<div class="flex flex-col justify-center gap-2 items-center w-full">
					<button @click="displayPasswordPage = !displayPasswordPage" class="w-2/5 py-2 px-4 text-xs font-medium text-gray-800 bg-red-100 rounded border border-red-200 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
						Password/Name
					</button>
					<button @click="displayAdminPage = !displayAdminPage" class="w-2/5 py-2 px-4 text-xs font-medium text-gray-800 bg-red-100 rounded border border-red-200 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
						Administrator
					</button>
					<button @click="displayMuteBanPage = !displayMuteBanPage" class="w-2/5 py-2 px-4 text-xs font-medium text-gray-800 bg-red-100 rounded border border-red-200 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
						Mute/Ban
					</button>
				</div>
			</div>
		</div>
		<ChannelPasswordName v-else-if="displayPasswordPage" @close="displayPasswordPage = !displayPasswordPage" @validate="changeNamePassword" :inChannel="inChannel"></ChannelPasswordName>
		<channel-admin v-else-if="displayAdminPage" @return="displayAdminPage = !displayAdminPage" :inChannel="inChannel"></channel-admin>
	</div>
	
	<!-- <div class="overflow-y-auto h-full w-full">
		<div v-for="user in inChannel?.users" :key="user.id" class="flex justify-between items-center h-[calc(100%_/_4) border-b-[1px] w-full border-red-400">
			<div class="inline-flex items-center py-4">
				<img class="shrink-0 w-12 h-12 rounded-full object-cover border-t-[1px] border-zinc-300" :src="user.avatar" alt="Rounded avatar">
				<p class="px-4 text-sm">{{ user.username }}</p>
			</div>
			<svg class="h-10 w-10 mr-6">
				<circle cx="20" cy="20" r="8"  fill="none" stroke="#f87171" stroke-width="1" />
			</svg>
		</div>
	</div>
	<Button-CloseValidate @validate="emit('validate')" @close="emit('close')"></Button-CloseValidate> -->
</template>