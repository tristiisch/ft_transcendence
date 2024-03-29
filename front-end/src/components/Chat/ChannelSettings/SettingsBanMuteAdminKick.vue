<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';
import { ref, onBeforeMount } from 'vue';
import { useGlobalStore } from '@/stores/globalStore';
import type User from '@/types/User';
import ButtonCloseValidate from '@/components/Button/ButtonCloseValidate.vue'
import UsersList from '@/components/Divers/UsersChannelsList.vue';

const chatStore = useChatStore();
const userStore = useUserStore();
const globalStore = useGlobalStore();
const selectableUsers = ref<User[]>([])
const props = defineProps<{ type: string; }>();

const emit = defineEmits<{ 
	(e: 'close'): void
	(e: 'validate'): void 
}>()

function alreadySelectedUsers() {
	if (chatStore.inChannel) {
		if (props.type === 'ban')
			return chatStore.inChannel.banned
		else if (props.type === 'admin')
			return chatStore.inChannel.admins
		else if (props.type === 'mute')
			return chatStore.inChannel.muted
		else
			return []
	}
	return null
}

function updateSelectableUsers() {
	if (chatStore.inChannel){
		const bannedAndMember: User[] = []
		for(const member of selectableUsers.value)
			bannedAndMember.push(member)
		if (chatStore.inChannel.banned) {
			for(const banned of chatStore.inChannel.banned)
				bannedAndMember.push(banned)
		}
		return selectableUsers.value = bannedAndMember
	}
}

function updateChangeInChannel() {
	if (selectableUsers.value.length) {
		if (chatStore.inChannel && globalStore.isTypeArrayUsers(globalStore.selectedItems)) {
			let newList: { list: User[], userWhoSelect: User } = {
				list: globalStore.selectedItems,
				userWhoSelect: userStore.userData
			};
			if (props.type === 'admin' && globalStore.checkChangeInArray(chatStore.inChannel.admins))
				chatStore.updateAdminList(chatStore.inChannel, newList);
			else if (props.type === 'ban' && globalStore.checkChangeInArray(chatStore.inChannel.banned))
				chatStore.updateBanList(chatStore.inChannel, newList);
			else if (props.type === 'mute' && globalStore.checkChangeInArray(chatStore.inChannel.muted))
				chatStore.updateMuteList(chatStore.inChannel, newList);
			else if (props.type === 'kick')
				chatStore.KickUsers(chatStore.inChannel, newList);
			globalStore.resetSelectedItems();
		}
		emit('validate');
	}
}

onBeforeMount(() => {
	if (chatStore.inChannel)
		selectableUsers.value = chatStore.inChannel.users.filter(user => user.id !== userStore.userData.id && user.id !== chatStore.inChannel?.owner?.id)
	if (props.type === 'ban')
		updateSelectableUsers();
})
</script>

<template>
    <users-list :selectableItems="selectableUsers" :singleSelection="false" :alreadySelectedUsers="alreadySelectedUsers()" :type="'user'"></users-list>
    <button-close-validate @validate="updateChangeInChannel()" @close="emit('close')"></button-close-validate>
</template>