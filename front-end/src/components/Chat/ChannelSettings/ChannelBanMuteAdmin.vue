<script setup lang="ts">
import ButtonCloseValidate from '@/components/Chat/ButtonCloseValidate.vue'
import DisplayList from '@/components/Chat/DisplayList.vue';
import type User from '@/types/User';
import { useChatStore } from '@/stores/chatStore';
import { ref, computed, onBeforeMount } from 'vue';

const chatStore = useChatStore();
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
	if (props.type === 'admin')
		chatStore.updateAdminArray()
	else if (props.type === 'ban')
		chatStore.updateBanArray()
	else if (props.type === 'mute')
		chatStore.updateMuteArray()
	emit('validate')
}

onBeforeMount(() => {
	if (chatStore.inChannel)
		selectableUsers.value = chatStore.inChannel.users
	if (props.type === 'ban')
		updateSelectableUsers()
})
</script>

<template>
    <display-list :selectableItems="selectableUsers" :singleSelection="false" :alreadySlectedUsers="alreadySelectedUsers()" :type="'user'"></display-list>
    <button-close-validate @validate="updateChangeInChannel()" @close="emit('close')"></button-close-validate>
</template>