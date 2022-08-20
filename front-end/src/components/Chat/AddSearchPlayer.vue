<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { useUserStore } from '@/stores/userStore'
import type User from '@/types/User';
import UsersService from '@/services/UserService';
import PlayerDisplayList from '@/components/Chat/PlayerDisplayList.vue';

const userStore = useUserStore();
const userToggle = ref(false);
const users = ref([] as User[]);
const friends = ref([] as User[]);

function fetchUsers() {
	UsersService.getUsers()
		.then((response) => {
			users.value = response.data;
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

function fetchfriends() {
	UsersService.getUserfriends(userStore.userData.id)
		.then((response) => {
			for (let i = 0; i < response.data.length; i++) {
				users.value.find((user) => {
					if (user.username === response.data[i]) friends.value.push(user);
				});
			}
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

const emit = defineEmits<{
	(e: 'close'): void,
	(e: 'validate'): void
}>()

onBeforeMount(() => {
	fetchUsers();
	fetchfriends();
});
</script>

<template>
	<div class="flex flex-col items-center w-full px-6 3xl:px-10 h-full">
		<form class="flex w-full pb-4">
			<div class="self-start relative">
				<button @click="userToggle = !userToggle" class="relative flex-shrink-0 inline-flex items-center rounded-l-lg border border-blue-600 py-2 px-3 text-sm font-medium text-center text-white bg-blue-600" type="button">Filter<svg aria-hidden="true" class="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button>
				<div v-show="userToggle" class="absolute z-10 w-44 bg-red-100 rounded shadow">
					<ul  class="py-1 text-sm text-gray-700">
						<li>
							<button type="button" class="inline-flex py-2 px-4 w-full hover:bg-gray-100">Friends</button>
						</li>
						<li>
							<button type="button" class="inline-flex py-2 px-4 w-full hover:bg-gray-100">All</button>
						</li>
					</ul>
				</div>
			</div>
			<div class="relative w-full">
				<input type="search" class="block p-2 w-full text-sm placeholder:text-gray-400 bg-neutral-100 border border-blue-600 rounded-r-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Search Player" required>
			</div>
		</form>
		<player-display-list @validate="emit('validate')" @close="emit('close')" :users="users"></player-display-list>
	</div>
</template>