<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { ref, computed } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import Status, { ChatStatus } from '@/types/ChatStatus';
import PartToDisplay from '@/types/ChatPartToDisplay';
import SettingsBanMuteAdminKick from '@/components/Chat/ChannelSettings/SettingsBanMuteAdminKick.vue';
import ButtonReturnNext from '@/components/Button/ButtonReturnNext.vue';
import SettingsPasswordName from '@/components/Chat/ChannelSettings/SettingsPasswordName.vue';
import UsersChannelsNameImage from '@/components/Chat/UsersChannelNameImages.vue';
import SettingsInvite from '@/components/Chat/ChannelSettings/SettingsInvite.vue';

const chatStore = useChatStore();
const userStore = useUserStore();
const displayPasswordPage = ref(false);
const displayAdminPage = ref(false);
const displayMutePage = ref(false);
const displayBanPage = ref(false);
const displayInvitePage = ref(false);
const displayKickPage = ref(false);


function playerStatus() {
	if (chatStore.inChannel && chatStore.inChannel.owner) {
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
	if (chatStore.inChannel && chatStore.inChannel.owner) {
		return chatStore.inChannel?.owner.id === userStore.userData.id
	}
}

function isAdmin() { 
	if (chatStore.inChannel && chatStore.inChannel.admins) {
		for(const user of chatStore.inChannel.admins)
			if (user.id === userStore.userData.id)
				return true	
	}
	return false
}

function setColSpan() {
	if ((isOwner() && chatStore.inChannel?.type === ChatStatus.PRIVATE) || (!isOwner() && !isAdmin()) || (!isOwner() && isAdmin() && (chatStore.inChannel?.type !== ChatStatus.PRIVATE)))
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

function administratorStatus() { return chatStore.inChannel && chatStore.inChannel.admins ? chatStore.inChannel.admins.length : 0 }
function muteStatus() { return chatStore.inChannel && chatStore.inChannel.muted ? chatStore.inChannel.muted.length : 0 }
function banStatus() { return chatStore.inChannel && chatStore.inChannel.banned ? chatStore.inChannel.banned.length : 0 }

function displayButton() {
	return !displayAdminPage.value && !displayMutePage.value && !displayBanPage.value
		&& !displayPasswordPage.value && !displayInvitePage.value && !displayKickPage.value
}

function resetDisplayPage() {
	
	if (displayAdminPage.value)
		displayAdminPage.value = !displayAdminPage.value
	else if (displayMutePage.value)
		displayMutePage.value = !displayMutePage.value
	else if (displayBanPage.value)
		displayBanPage.value = !displayBanPage.value
	else if (displayKickPage.value)
		displayKickPage.value = ! displayKickPage.value
	else if (displayPasswordPage.value)
		displayPasswordPage.value = !displayPasswordPage.value
	else
		displayInvitePage.value = !displayInvitePage.value
}

const isType = computed(() => {
	if (displayAdminPage.value)
		return 'admin'
	else if (displayMutePage.value)
		return 'mute'
	else if (displayBanPage.value)
		return 'ban'
	else
		return 'kick'
});

function leaveChannel() {
	if (chatStore.inChannel) 
		chatStore.leaveChannel(chatStore.inChannel, userStore.userData)
}
</script>

<template>
	<div class="flex flex-col justify-between h-full w-full px-8 3xl:px-10">
		<users-channels-name-image v-if="!displayInvitePage"></users-channels-name-image>
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
				<button v-if="isAdmin() || isOwner()" @click="displayAdminPage = !displayAdminPage" class="py-2 px-4 text-xs text-blue-600 bg-neutral-100 rounded-md border border-blue-600 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
					Administrator
				</button>
				<button v-if="isAdmin() || isOwner()" @click="displayMutePage = !displayMutePage" class="py-2 px-4 text-xs text-blue-600 bg-neutral-100 rounded-md border border-blue-600 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
					Mute
				</button>
				<button v-if="isAdmin() || isOwner()" @click="displayKickPage = !displayKickPage" class="py-2 px-4 text-xs text-blue-600 bg-neutral-100 rounded-md border border-blue-600 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
					Kick
				</button>
				<button v-if="isAdmin() || isOwner()" @click="displayBanPage = !displayBanPage" class="py-2 px-4 text-xs text-blue-600 bg-neutral-100 rounded-md border border-blue-600 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
					Ban
				</button>
				<button v-if="isAdmin()|| isOwner() && chatStore.inChannel?.type === ChatStatus.PRIVATE" @click="displayInvitePage = !displayInvitePage" class="py-2 px-4 text-xs text-blue-600 bg-neutral-100 rounded-md border border-blue-600 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
					Invite
				</button>
				<button :class="setColSpan()" @click="leaveChannel()" class="bg-neutral-100 text-red-600 py-2 px-4 text-xs rounded-md border border-red-600 hover:bg-red-600 hover:text-white sm:text-sm">LEAVE</button>
			</div>
		</div>
		<button-return-next v-if="displayButton()" :side="'previous'" @click="chatStore.setRightPartToDisplay(PartToDisplay.CHAT)" class="self-end"></button-return-next>
		<settings-password-name v-else-if="displayPasswordPage" @close="resetDisplayPage()"></settings-password-name>
		<settings-invite v-else-if="displayInvitePage" @validate="resetDisplayPage()" @close="resetDisplayPage()"></settings-invite>
		<settings-ban-mute-admin-kick v-else @validate="resetDisplayPage()" @close="resetDisplayPage()" :type="isType"></settings-ban-mute-admin-kick>
	</div>
</template>