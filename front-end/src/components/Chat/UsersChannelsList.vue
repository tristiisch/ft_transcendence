<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import { onBeforeMount, ref, watch } from 'vue'
import type User from '@/types/User';
import type Channel from '@/types/Channel';


const chatStore = useChatStore();
const showCheckMark = ref([] as boolean[])

const props = defineProps<{
    selectableItems: User[] | Channel[]; 
	alreadySlectedUsers: User[] | null;
	singleSelection: boolean;
}>()

const emit = defineEmits<{
	(event: 'close'): void
	(event: 'validate'): void;
}>();

function markItems(index: number)
{
	if (props.singleSelection) {
		for (const value of showCheckMark.value)						//check if there is already an active selection, only one selection possible
			if (value === true) return
	}
	showCheckMark.value[index] = true
	chatStore.setSelectedItem(props.selectableItems[index], props.singleSelection)
}

function unmarkItems(index: number)
{
	const userToUncheckId = props.selectableItems[index].id
	if(userToUncheckId) chatStore.unsetSelectItem(userToUncheckId, props.singleSelection)
	showCheckMark.value[index] = false
}

function treatAlreadyMarkedUsers()
{
	if (props.alreadySlectedUsers)
	{
		for(const markedUser of props.alreadySlectedUsers) {
			let index = props.selectableItems.findIndex(user => user.id === markedUser.id)
			showCheckMark.value[index] = true
			chatStore.setSelectedItem(markedUser, props.singleSelection)
		}
	}
}

function displayName(item: User | Channel) {
	return chatStore.isTypeUser(item) ? item.username : item.name
}

function formAvatar(item: User | Channel) {
	return chatStore.isTypeUser(item) ? 'rounded-full' : 'rounded'
}

watch(() => props.selectableItems, () => {
	showCheckMark.value = []
});

onBeforeMount(() => {
	treatAlreadyMarkedUsers()
});
</script>

<template>
    <div class="overflow-y-auto w-full h-full">
		<div v-for="(item, index) in selectableItems" :key="item.id" class="flex justify-between items-center h-[calc(100%_/_4)] sm:h-[calc(100%_/_5)] 3xl:h-[calc(100%_/_6)] border-b w-full border-red-400">
			<div class="inline-flex items-center py-4">
				<img class="shrink-0 w-12 h-12 rounded-full object-cover border border-red-400" :class="formAvatar(item)" :src="item.avatar" alt="Rounded avatar">
				<p class="px-4 text-sm text-red-200">{{ displayName(item) }}</p>
			</div>
			<button v-if="!showCheckMark[index]" @click="markItems(index)">
				<svg class="h-10 w-10 mr-6">
					<circle cx="20" cy="20" r="8"  fill="none" stroke="#f87171" stroke-width="1" />
				</svg>
			</button>
			<button v-else @click="unmarkItems(index)" class="flex items-center justify-center h-10 w-10 mr-6">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#2563EB"><path fill-rule="evenodd" d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1 17l-5-5.299 1.399-1.43 3.574 3.736 6.572-7.007 1.455 1.403-8 8.597z" clip-rule="evenodd"/></svg>
			</button>
		</div>
	</div>
</template>