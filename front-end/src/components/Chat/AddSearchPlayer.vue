<script setup lang="ts">
import { ref, onBeforeMount, watch, toDisplayString } from 'vue'
import { useToast } from 'vue-toastification';
import type User from '@/types/User';
import DisplayList from '@/components/Chat/DisplayList.vue';
import type Channel from '@/types/Channel';
import { useChatStore } from '@/stores/chatStore';
import ChatStatus from '@/types/ChatStatus';

const chatStore = useChatStore();
const error = ref('');
const toast = useToast();
const userToggle = ref(false);
const itemsToDisplay = ref<User[] | Channel[]>([])
const itemName = ref('');

const props = defineProps<{
	singleSelection: boolean;
	type: string;
 }>();

function changeDisplayToFriends() { itemsToDisplay.value = chatStore.friends }
function changeDisplayToAllUsers() { itemsToDisplay.value = chatStore.users }
function changeDisplayToPublic() { itemsToDisplay.value = chatStore.channels.filter(channel => channel.type === ChatStatus.PUBLIC) }
function changeDisplayToProtected() { itemsToDisplay.value = chatStore.channels.filter(channel => channel.type === ChatStatus.PROTECTED) }
function changeDisplayToAllChannels() { itemsToDisplay.value = chatStore.channels }

function placeHolder() {
	return props.type === 'users' ? 'player name' : 'channel name'
}

function searchPlayer()
{
	if (itemName.value != '') {
		if (chatStore.isTypeArrayUsers(itemsToDisplay.value))
			return itemsToDisplay.value.filter((item) => item.username.toLowerCase().includes(itemName.value.toLowerCase()))
		else
			return itemsToDisplay.value.filter((item) => item.name.toLowerCase().includes(itemName.value.toLowerCase()))
	}
	else 
		return itemsToDisplay.value
}

watch(() => itemName.value, () => {
	searchPlayer()
});

onBeforeMount(() => {
	chatStore.fetchUsers().catch((e: Error) => {
			error.value = e.message
			toast.error(error.value);
		});
	chatStore.fetchfriends().catch((e: Error) => {
			error.value = e.message
			toast.error(error.value);
		});
	chatStore.fetchChannels().catch((e: Error) => {
		error.value = e.message
		toast.error(error.value);
	});
	if (props.type === 'users')
		itemsToDisplay.value = chatStore.users
	else
		itemsToDisplay.value = chatStore.channels
});
</script>

<template>
	<form class="flex w-full pb-4" @submit.prevent>
		<div class="self-start relative">
			<button @click="userToggle = !userToggle" class="relative flex-shrink-0 inline-flex items-center rounded-l-lg border border-blue-600 py-2 px-3 text-sm font-medium text-center text-white bg-blue-600" type="button">Filter<svg aria-hidden="true" class="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button>
			<div v-show="userToggle" class="absolute z-10 w-44 bg-red-100 rounded shadow">
				<ul  v-if="chatStore.isTypeArrayUsers(itemsToDisplay)" class="py-1 text-sm text-gray-700">
					<li>
						<button @click="changeDisplayToFriends(), userToggle = !userToggle" type="button" class="inline-flex py-2 px-4 w-full hover:bg-gray-100">
							Friends
						</button>
					</li>
					<li>
						<button @click="changeDisplayToAllUsers(), userToggle = !userToggle" type="button" class="inline-flex py-2 px-4 w-full hover:bg-gray-100">
							All
						</button>
					</li>
				</ul>
				<ul  v-else class="py-1 text-sm text-gray-700">
					<li>
						<button @click="changeDisplayToPublic(), userToggle = !userToggle" type="button" class="inline-flex py-2 px-4 w-full hover:bg-gray-100">
							Public
						</button>
					</li>
					<li>
						<button @click="changeDisplayToProtected(), userToggle = !userToggle" type="button" class="inline-flex py-2 px-4 w-full hover:bg-gray-100">
							Protected
						</button>
					</li>
					<li>
						<button @click="changeDisplayToAllChannels(), userToggle = !userToggle" type="button" class="inline-flex py-2 px-4 w-full hover:bg-gray-100">
							All
						</button>
					</li>
				</ul>
			</div>
		</div>
		<div class="relative w-full">
			<input type="search" v-model="itemName" class="block p-2 w-full text-sm placeholder:text-gray-400 bg-neutral-100 border border-blue-600 rounded-r-lg focus:ring-blue-500 focus:border-blue-500" :placeholder=placeHolder() required>
		</div>
	</form>
	<display-list :selectableItems="searchPlayer()" :singleSelection="singleSelection" :alreadySlectedUsers="null" :type="'user'"></display-list>
</template>