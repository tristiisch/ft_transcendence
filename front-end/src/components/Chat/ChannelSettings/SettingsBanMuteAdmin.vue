<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import { ref, computed, onBeforeMount } from 'vue';
import { useGlobalStore } from '@/stores/globalStore';
import type User from '@/types/User';
import ButtonCloseValidate from '@/components/Button/ButtonCloseValidate.vue'
import UsersList from '@/components/Divers/UsersChannelsList.vue';

const chatStore = useChatStore();
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
		else 
			return chatStore.inChannel.muted
	}
	return null
}

function updateSelectableUsers() {
	if (chatStore.inChannel){
		const bannedAndMember: User[] = []
		for(const member of chatStore.inChannel.users)
			bannedAndMember.push(member)
		for(const banned of chatStore.inChannel.banned)
			bannedAndMember.push(banned)
		return selectableUsers.value = bannedAndMember
	}
}

function updateChangeInChannel() {
	if (chatStore.inChannel && globalStore.isTypeArrayUsers(globalStore.selectedItems)) {
		if (globalStore.checkChangeInArray(chatStore.inChannel.banned)) {
			const newList = globalStore.selectedItems;
			if (props.type === 'admin' && globalStore.checkChangeInArray(chatStore.inChannel.admins))
				chatStore.updateAdminList(chatStore.inChannel, newList);
			else if (props.type === 'ban' && globalStore.checkChangeInArray(chatStore.inChannel.banned))
				chatStore.updateBanList(chatStore.inChannel, newList);
			else if (props.type === 'mute' && globalStore.checkChangeInArray(chatStore.inChannel.muted))
				chatStore.updateMuteList(chatStore.inChannel, newList);
			globalStore.resetSelectedItems();
		}
	}
	emit('validate');
}

onBeforeMount(() => {
	if (chatStore.inChannel)
		selectableUsers.value = chatStore.inChannel.users
	if (props.type === 'ban')
		updateSelectableUsers()
})
</script>

<template>
    <users-list :selectableItems="selectableUsers" :singleSelection="false" :alreadySlectedUsers="alreadySelectedUsers()" :type="'user'"></users-list>
    <button-close-validate @validate="updateChangeInChannel()" @close="emit('close')"></button-close-validate>
</template>