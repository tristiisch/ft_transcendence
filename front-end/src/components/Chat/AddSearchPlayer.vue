<script setup lang="ts">
import { ref, onBeforeMount, watch, toDisplayString } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useToast } from 'vue-toastification';
import type User from '@/types/User';
import UserService from '@/services/UserService';
import PlayerDisplayList from '@/components/Chat/PlayerDisplayList.vue';

const error = ref('');
const toast = useToast();
const userStore = useUserStore();
const userToggle = ref(false);
const playerToDisplay = ref<User[]>([])
const users = ref<User[]>([]);
const friends = ref<User[]>([]);
const playerName = ref('');

const props = defineProps<{ singleSelection: boolean }>();

function fetchUsers() {
	UserService.getUsers()
		.then((response) => {
			users.value = response.data;
			playerToDisplay.value = response.data;
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

function fetchfriends() {
	UserService.getUserfriends(userStore.userData.id)
		.then((response) => {
				friends.value = response.data
		})
		.catch((e) => {
			error.value = e.response.data.message
			toast.error(error.value);
		});
}

const emit = defineEmits<{
	(e: 'close'): void,
	(e: 'validateAddDiscussion', user: User): void
	(e: 'validateAddChannel', users: User[]): void
}>()

function changeDisplayToFriends() { playerToDisplay.value = friends.value }
function changeDisplayToAll() { playerToDisplay.value = users.value }

function searchPlayer()
{
	if (playerName.value != '')
	{
		return playerToDisplay.value.filter((player) => 
		player.username.toLowerCase().includes(playerName.value.toLowerCase()))
	}
	else 
		return playerToDisplay.value
}

watch(() => playerName.value, () => {
	searchPlayer()
});

onBeforeMount(() => {
	fetchUsers();
	fetchfriends();
});
</script>

<template>
	<div class="flex flex-col items-center w-full px-6 3xl:px-10 h-full">
		<form class="flex w-full pb-4" @submit.prevent>
			<div class="self-start relative">
				<button @click="userToggle = !userToggle" class="relative flex-shrink-0 inline-flex items-center rounded-l-lg border border-blue-600 py-2 px-3 text-sm font-medium text-center text-white bg-blue-600" type="button">Filter<svg aria-hidden="true" class="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button>
				<div v-show="userToggle" class="absolute z-10 w-44 bg-red-100 rounded shadow">
					<ul  class="py-1 text-sm text-gray-700">
						<li>
							<button @click="changeDisplayToFriends(), userToggle = !userToggle" type="button" class="inline-flex py-2 px-4 w-full hover:bg-gray-100">Friends</button>
						</li>
						<li>
							<button @click="changeDisplayToAll(), userToggle = !userToggle" type="button" class="inline-flex py-2 px-4 w-full hover:bg-gray-100">All</button>
						</li>
					</ul>
				</div>
			</div>
			<div class="relative w-full">
				<input type="search" v-model="playerName" class="block p-2 w-full text-sm placeholder:text-gray-400 bg-neutral-100 border border-blue-600 rounded-r-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Search Player" required>
			</div>
		</form>
		<player-display-list @validateAddPlayer="(user) => emit('validateAddDiscussion', user)" @validateAddPlayers="(users) => emit('validateAddChannel', users)" @close="emit('close')" :users="searchPlayer()" :singleSelection="singleSelection" :banOrMuteOrAdminUsers="null"></player-display-list>
	</div>
</template>