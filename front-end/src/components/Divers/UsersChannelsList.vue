<script setup lang="ts">
import { useGlobalStore } from '@/stores/globalStore';
import { useChatStore } from '@/stores/chatStore';
import { onBeforeMount, ref, watch } from 'vue'
import type User from '@/types/User';
import PartToDisplay from '@/types/ChatPartToDisplay';
import type Channel from '@/types/Channel';

const globalStore = useGlobalStore();
const chatStore = useChatStore();
const showCheckMark = ref([] as boolean[])

const props = defineProps<{
	selectableItems: User[] | Channel[]; 
	alreadySelectedUsers: User[] | null;
	singleSelection: boolean;
}>()

function markItems(index: number) {
	if (props.singleSelection) {
		for (const value of showCheckMark.value)						//check if there is already an active selection, only one selection possible
			if (value === true) return
	}
	if (!props.singleSelection) {
		if (globalStore.isTypeArrayUsers(globalStore.selectedItems)
			&& globalStore.isTypeArrayUsers(props.selectableItems)
			&& globalStore.isTypeUser(props.selectableItems[index])) 
			globalStore.selectedItems.push(props.selectableItems[index])
		else if (!globalStore.isTypeArrayUsers(globalStore.selectedItems)
			&& !globalStore.isTypeArrayUsers(props.selectableItems)
			&& !globalStore.isTypeUser(props.selectableItems[index]))
			globalStore.selectedItems.push(props.selectableItems[index])
	}
	else
		globalStore.selectedItems[0] = props.selectableItems[index];
	showCheckMark.value[index] = true
}

function unmarkItems(index: number)
{
	const itemToUnmarkId = props.selectableItems[index].id
	if (!props.singleSelection) {
		const indexArraycurrentSelection = globalStore.selectedItems.findIndex((item) => item.id === itemToUnmarkId);
		globalStore.selectedItems.splice(indexArraycurrentSelection, 1);
	} 
	else
		globalStore.selectedItems.splice(0, 1);
	showCheckMark.value[index] = false
}

function treatAlreadyMarkedUsers()
{
	if (props.alreadySelectedUsers)
	{
		for(const markedUser of props.alreadySelectedUsers) {
			let index = props.selectableItems.findIndex(user => user.id === markedUser.id)
			showCheckMark.value[index] = true
			if(globalStore.isTypeArrayUsers(globalStore.selectedItems) && globalStore.isTypeUser(markedUser))
				globalStore.selectedItems.push(markedUser)
		}
	}
}

function displayName(item: User | Channel) {
	return globalStore.isTypeUser(item) ? item.username : item.name
}

function formAvatar(item: User | Channel) {
	globalStore.isTypeUser(item) ? 'rounded-full' : 'rounded'
}

watch(() => props.selectableItems, () => {
	showCheckMark.value = []
});

onBeforeMount(() => {
	treatAlreadyMarkedUsers()
});
</script>

<template>
	<div v-if="selectableItems.length !== 0" class="overflow-y-auto w-full h-full">
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
	<div v-else class="flex justify-center items-center w-full h-full text-xl text-neutral-100 font-Arlon"> {{ chatStore.cardRightPartToDisplay === PartToDisplay.ADD_CHANNEL ?  'NO CHANNEL' : 'NO PERSON SELECTABLE' }}</div>
</template>