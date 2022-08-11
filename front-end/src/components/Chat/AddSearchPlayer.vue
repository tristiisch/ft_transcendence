<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { useUserStore } from '@/stores/userStore'
import type User from '@/types/User';
import UsersService from '@/services/UserService';

const userStore = useUserStore();
const userToggle = ref(false);
const users = ref([] as User[]);
const friends = ref([] as User[]);

const emit = defineEmits<{
	(e: 'close'): void,
	(e: 'validate'): void
}>()

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
	UsersService.getUserfriends(userStore.userData.username)
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

onBeforeMount(() => {
	fetchUsers();
	fetchfriends();
});
</script>

<template>
	<form class="flex w-full pb-4">
		<div class="self-start relative">
			<button @click="userToggle = !userToggle" class="relative flex-shrink-0 inline-flex items-center rounded-l-lg py-2 px-3 text-sm font-medium text-center text-white bg-blue-600" type="button">Filter<svg aria-hidden="true" class="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button>
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
			<input type="search" class="block p-2 w-full text-sm placeholder:text-gray-400 bg-red-100 border-l-red-100 rounded-r-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Search Player" required>
		</div>
	</form>
	<div class="overflow-y-auto h-full w-full">
		<div v-for="user in users" :key="user.id" class="flex justify-between items-center h-[calc(100%_/_4)] sm:h-[calc(100%_/_5)] border-b-[1px] w-full border-red-400">
			<div class="inline-flex items-center py-4">
				<img class="shrink-0 w-12 h-12 rounded-full object-cover border-t-[1px] border-zinc-300" :src="user.avatar" alt="Rounded avatar">
				<p class="px-4 text-sm">{{ user.username }}</p>
			</div>
			<svg class="h-10 w-10 mr-6 w-full">
				<circle cx="20" cy="20" r="8"  fill="none" stroke="#f87171" stroke-width="1" />
			</svg>
		</div>
	</div>
	<div class="self-end flex gap-3 mr-6">
		<button @click="emit('close')" class="bg-red-600 text-red-200 border border-red-700 hover:text-white rounded-lg mt-4 focus:ring-2 focus:ring-gray-300 p-1 sm:p-2 inline-flex h-6 w-6 sm:h-9 sm:w-9">
			<svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
		</button>
		<button @click="emit('validate')" class=" bg-green-600 text-green-200  hover:text-white rounded-lg mt-4 focus:ring-2 focus:ring-gray-300 p-1 sm:p-2 inline-flex h-6 w-6 sm:h-9 sm:w-9">
			<svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
		</button>
	</div>
</template>