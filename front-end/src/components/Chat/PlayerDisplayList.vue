<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue'
import type User from '@/types/User';
import ButtonCloseValidate from '@/components/Chat/ButtonCloseValidate.vue';

const showCheckMark = ref([] as boolean[])
const selectedUsers = ref<User[]>([])
const selectedUser = ref<User | null>(null)

const props = defineProps<{ 
users: User[]; 
singleSelection: boolean
banOrMuteOrAdminUsers: User[] | null
}>();

function markUsers(index: number)
{
	if (props.singleSelection === false)
	{
		showCheckMark.value[index] = true
		selectedUsers.value.push(props.users[index])
		return
	}
	for (const value of showCheckMark.value)						//check if there is already an active selection, only one selection possible
		if (value === true) return
	showCheckMark.value[index] = true
	selectedUser.value = props.users[index]
}

function unmarkUsers(index: number)
{
	
	const userToUncheckId = props.users[index].id
	if (!selectedUser.value)
	{
		const indexArraySelectedUsers = selectedUsers.value.findIndex(user => user.id === userToUncheckId)
		selectedUsers.value.splice(indexArraySelectedUsers, 1);
	}
	else
		selectedUser.value = null
	showCheckMark.value[index] = false
}

function emitMarkedUsers()
{
	if (selectedUser.value) emit('validateAddPlayer', selectedUser.value)
	else if (selectedUsers.value != []) emit('validateAddPlayers', selectedUsers.value)
}

const emit = defineEmits<{
	(e: 'close'): void,
	(e: 'validateAddPlayers', users: User[]): void,
	(e: 'validateAddPlayer', user: User): void
}>()

watch(() => props.users, () => {
	showCheckMark.value = []
});

onBeforeMount(() => {
	if (props.banOrMuteOrAdminUsers)
	{
		for(const checkedUser of props.banOrMuteOrAdminUsers)
		{
			let index = props.users.findIndex(user => user.id === checkedUser.id)
			showCheckMark.value[index] = true
			selectedUsers.value.push(checkedUser)
		}
	}
});

</script>

<template>
    <div class="overflow-y-auto h-full w-full">
		<div v-for="(user, index) in users" :key="user.id" class="flex justify-between items-center h-[calc(100%_/_4)] sm:h-[calc(100%_/_5)] 3xl:h-[calc(100%_/_6)] border-b w-full border-red-400">
			<div class="inline-flex items-center py-4">
				<img class="shrink-0 w-12 h-12 rounded-full object-cover border border-red-400" :src="user.avatar" alt="Rounded avatar">
				<p class="px-4 text-sm text-red-200">{{ user.username }}</p>
			</div>
			<button v-if="!showCheckMark[index]" @click="markUsers(index)">
				<svg class="h-10 w-10 mr-6">
					<circle cx="20" cy="20" r="8"  fill="none" stroke="#f87171" stroke-width="1" />
				</svg>
			</button>
			<button v-else @click="unmarkUsers(index)" class="flex items-center justify-center h-10 w-10 mr-6">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#2563EB"><path fill-rule="evenodd" d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1 17l-5-5.299 1.399-1.43 3.574 3.736 6.572-7.007 1.455 1.403-8 8.597z" clip-rule="evenodd"/></svg>
			</button>
		</div>
	</div>
	<ButtonCloseValidate @validate="emitMarkedUsers()" @close="emit('close')"></ButtonCloseValidate>
</template>