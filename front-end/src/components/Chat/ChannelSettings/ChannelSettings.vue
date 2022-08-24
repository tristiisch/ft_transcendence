
<script setup lang="ts">
import type Channel from '@/types/Channel';
import Status from '@/types/ChannelStatus';
import ButtonReturnNext from '@/components/Chat/ButtonReturnNext.vue';
import ChannelPasswordName from '@/components/Chat/ChannelSettings/ChannelPasswordName.vue';
import PlayerDisplayList from '@/components/Chat/PlayerDisplayList.vue';
import ChatTopImage from '@/components/Chat/ChatTopImage.vue';
import { useUserStore } from '@/stores/userStore';
import { ref, computed } from 'vue';

const userStore = useUserStore();
const displayPasswordPage = ref(false);
const displayAdminPage = ref(false);
const displayMutePage = ref(false);
const displayBanPage = ref(false);
const props = defineProps<{ inChannel: Channel; }>();
const ChannelUsers = ref(props.inChannel.users)

const emit = defineEmits<{
	(e: 'return'): void,
}>()

function playerStatusText(channel: Channel)
{
		if (channel.owner === userStore.userData.username) return 'OWNER'
		else 
		{
			for (const member of channel.admin)
				if (member.username === userStore.userData.username)
					return 'ADMINISTRATOR'
			return 'MEMBER'
		}
}

function isOwner() { return props.inChannel.owner === userStore.userData.username}

function isAdmin() { 
	for(const user of props.inChannel.admin)
		if (user.username === userStore.userData.username)
			return true
	return false
}

function setColSpan() {
	if (isOwner() || (!isOwner() && !isAdmin()))
		return 'col-span-2'
	return 'col-span-auto'
}

function passwordStatusText(status: Status)
{
	if (status === Status.PUBLIC) return 'PUBLIC'
	else if (status === Status.PRIVATE) return 'PRIVATE'
	else return 'PROTECTED'
}

function administratorStatusText() { return props.inChannel.admin.length }
function muteStatusText() { return props.inChannel.mute.length }
function banStatusText() { return props.inChannel.mute.length }

function displayButton() {
	return !displayAdminPage.value && !displayMutePage.value && !displayBanPage.value  && !displayPasswordPage.value 
}

function changeNamePassword()
{
	displayPasswordPage.value = !displayPasswordPage.value
}

function setDisplayPage()
{
	if (displayAdminPage.value)
		displayAdminPage.value = !displayAdminPage.value
	else if (displayMutePage.value)
		displayMutePage.value = !displayMutePage.value
	else
		displayBanPage.value = !displayBanPage.value
}

function updateMuteBan()
{

	setDisplayPage()
}


</script>

<template>
	<div class="flex flex-col justify-between h-full w-full px-8 3xl:px-10">
		<ChatTopImage :inDiscussion="null" :inChannel="inChannel"></ChatTopImage>
		<div v-if="displayButton()" class="flex flex-col justify-around h-full">
			<div class="flex flex-col justify-center items-center gap-5">
				<div class="text-center">
					<p class="text-red-200 text-xs sm:text-sm">your are <span class="text-red-800">{{ playerStatusText(inChannel) }}</span> of this channel.</p>
					<p class="text-red-200 text-xs sm:text-sm">The channel is <span class="text-red-800">{{ passwordStatusText(inChannel.type) }}</span>.</p>
					<p class="text-red-200 text-xs sm:text-sm">The channel has <span class="text-red-800">{{ administratorStatusText() }}</span> admin, <span span class="text-red-800">{{ muteStatusText() }}</span> mutted member and <span span class="text-red-800">{{ banStatusText() }}</span> banned</p>
				</div>
				<div class="grid grid-cols-2 gap-2 items-center w-full lg:w-3/4">
					<button  v-if="isOwner()" @click="displayPasswordPage = !displayPasswordPage" class="py-2 px-4 text-xs text-blue-600 bg-neutral-100 rounded-md border border-blue-600 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
						Password/Name
					</button>
					<button v-if="isAdmin()" @click="displayAdminPage = !displayAdminPage" class="py-2 px-4 text-xs text-blue-600 bg-neutral-100 rounded-md border border-blue-600 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
						Administrator
					</button>
					<button v-if="isAdmin()" @click="displayMutePage = !displayMutePage" class="py-2 px-4 text-xs text-blue-600 bg-neutral-100 rounded-md border border-blue-600 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
						Mute
					</button>
					<button v-if="isAdmin()" @click="displayBanPage = !displayBanPage" class="py-2 px-4 text-xs text-blue-600 bg-neutral-100 rounded-md border border-blue-600 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
						Ban
					</button>
					<button :class="setColSpan()" class="bg-neutral-100 text-red-600 py-2 px-4 text-xs rounded-md border border-red-600 hover:bg-red-600 hover:text-white sm:text-sm">Leave channel</button>
				</div>
			</div>
		</div>
		<ChannelPasswordName v-else-if="displayPasswordPage" @close="displayPasswordPage = !displayPasswordPage" @validate="changeNamePassword" :inChannel="inChannel"></ChannelPasswordName>
		<PlayerDisplayList v-else @close="setDisplayPage" @validate="updateMuteBan" :users="ChannelUsers" :singleSelection="false"></PlayerDisplayList>
		<ButtonReturnNext v-if="displayButton()" :side="'previous'" @click="emit('return')" class="self-end"></ButtonReturnNext>
	</div>
</template>