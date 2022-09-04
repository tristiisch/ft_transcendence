<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { ref } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import Status, { ChatStatus } from '@/types/ChatStatus';
import PartToDisplay from '@/types/ChatPartToDisplay';
import SettingsBanMuteAdmin from '@/components/Chat/ChannelSettings/SettingsBanMuteAdmin.vue';
import ButtonReturnNext from '@/components/Button/ButtonReturnNext.vue';
import SettingsPasswordName from '@/components/Chat/ChannelSettings/SettingsPasswordName.vue';
import UsersChannelsNameImage from '@/components/Chat/UsersChannelNameImages.vue';

const chatStore = useChatStore();
const userStore = useUserStore();
const displayPasswordPage = ref(false);
const displayAdminPage = ref(false);
const displayMutePage = ref(false);
const displayBanPage = ref(false);


function playerStatus() {
	if (chatStore.inChannel) {
		if (chatStore.inChannel.owner.id === userStore.userData.id) return 'OWNER'
		else {
			for (const member of chatStore.inChannel.admins)
				if (member.id === userStore.userData.id)
					return 'ADMINISTRATOR'
			return 'MEMBER'
		}
	}
}

function isOwner() { 
	if (chatStore.inChannel) {
		return chatStore.inChannel?.owner.id === userStore.userData.id
	}
}

function isAdmin() { 
	if (chatStore.inChannel) {
		for(const user of chatStore.inChannel.admins)
			if (user.id === userStore.userData.id)
				return true
		return false
	}
}

function setColSpan() {
	if (isOwner() || (!isOwner() && !isAdmin()))
		return 'col-span-2'
	return 'col-span-auto'
}

function passwordStatus() { 
	if (chatStore.inChannel) {
		if (chatStore.inChannel.type === Status.PUBLIC)
			return 'PUBLIC'
		else if (chatStore.inChannel.type=== Status.PRIVATE)
			return 'PRIVATE'
		else
			return 'PROTECTED'
	}
}

function administratorStatus() { return chatStore.inChannel?.admins.length }
function muteStatus() { return chatStore.inChannel?.muted.length }
function banStatus() { return chatStore.inChannel?.banned.length }

function displayButton() {
	return !displayAdminPage.value && !displayMutePage.value && !displayBanPage.value  && !displayPasswordPage.value 
}

function displayBanMuteAdmin() {
	return (displayAdminPage.value || displayMutePage.value || displayBanPage.value)
}

function resetDisplayPage() {
	
	if (displayAdminPage.value)
		displayAdminPage.value = !displayAdminPage.value
	else if (displayMutePage.value)
		displayMutePage.value = !displayMutePage.value
	else if (displayBanPage.value)
		displayBanPage.value = !displayBanPage.value
	else
		displayPasswordPage.value = !displayPasswordPage.value
}

function isType()
{
	if (displayAdminPage.value)
		return 'admin'
	else if (displayMutePage.value)
		return 'mute'
	else
		return 'ban'
}

function leaveChannel() {
	if (chatStore.inChannel) 
		chatStore.leaveChannel(chatStore.inChannel, userStore.userData)
}
</script>

<template>
	<div class="flex flex-col justify-between h-full w-full px-8 3xl:px-10">
		<users-channels-name-image></users-channels-name-image>
		<div v-if="displayButton()" class="flex flex-col justify-center h-full items-center gap-5">
			<div class="text-center">
				<p class="text-red-200 text-xs sm:text-sm">your are <span class="text-red-800">{{ playerStatus() }}</span> of this channel.</p>
				<p class="text-red-200 text-xs sm:text-sm">The channel is <span class="text-red-800">{{ passwordStatus() }}</span>.</p>
				<p class="text-red-200 text-xs sm:text-sm">The channel has <span class="text-red-800">{{ administratorStatus() }}</span> admin, <span span class="text-red-800">{{ muteStatus() }}</span> mutted member and <span span class="text-red-800">{{ banStatus() }}</span> banned</p>
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
				<button :class="setColSpan()" @click="leaveChannel()" class="bg-neutral-100 text-red-600 py-2 px-4 text-xs rounded-md border border-red-600 hover:bg-red-600 hover:text-white sm:text-sm">Leave channel</button>
			</div>
		</div>
		<button-return-next v-if="displayButton()" :side="'previous'" @click="chatStore.setRightPartToDisplay(PartToDisplay.CHAT)" class="self-end"></button-return-next>
		<settings-password-name v-else-if="displayPasswordPage" @close="resetDisplayPage()"></settings-password-name>
		<settings-ban-mute-admin v-else @validate="resetDisplayPage()" @close="resetDisplayPage()" :type="isType()"></settings-ban-mute-admin>
	</div>
</template>