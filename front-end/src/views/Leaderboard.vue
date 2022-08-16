<script setup lang="ts">
import UsersService from '@/services/UserService';
import type User from '@/types/User';
import { ref, computed, onBeforeMount, onBeforeUnmount } from 'vue';
import { useUserStore } from '@/stores/userStore';
import Toogle from '@/components/Leaderboard/ToogleButton.vue';
import CardLeaderboard from '@/components/Leaderboard/CardLeaderboard.vue';
import socket from '@/plugin/socketInstance';

const userStore = useUserStore();
const users = ref([] as User[]);
const friends = ref([] as User[]);
const type = ref<string>('All');
const isLoading = ref(false);

function rankOrder() {
	if (type.value === 'All') {
		users.value.sort((a, b) => {
			return a.rank - b.rank;
		});
	} else {
		friends.value.sort((a, b) => {
			return a.rank - b.rank;
		});
	}
}

function nameOrder() {
	if (type.value === 'All') {
		users.value.sort((a, b) => {
			let fa = a.username;
			let fb = b.username;
			if (fa < fb) return -1;
			if (fa > fb) return 1;
			return 0;
		});
	} else {
		friends.value.sort((a, b) => {
			let fa = a.username;
			let fb = b.username;
			if (fa < fb) return -1;
			if (fa > fb) return 1;
			return 0;
		});
	}
}

function statusOrder() {
	if (type.value === 'All') {
		users.value.sort((a, b) => {
			return b.current_status - a.current_status;
		});
	} else {
		friends.value.sort((a, b) => {
			return b.current_status - a.current_status;
		});
	}
}

function fetchUsers() {
	isLoading.value = true
	UsersService.getUsers()
		.then((response) => {
			users.value = response.data;
			isLoading.value = false
		})
		.catch((e: Error) => {
			isLoading.value = false
			console.log(e);
		});
	rankOrder();
}

function fetchfriends() {
	isLoading.value = true
	UsersService.getUserfriends(userStore.userData.username)
		.then((response) => {
			for (let i = 0; i < response.data.length; i++) {
				users.value.find((user) => {
					if (user.username === response.data[i]) friends.value.push(user);
				});
			}
			isLoading.value = false
		})
		.catch((e: Error) => {
			isLoading.value = false
			console.log(e);
		});
}

function switchDysplayUsers() {
	if (type.value === 'All') {
		type.value = 'Friends';
	} else {
		type.value = 'All';
	}
}

const displayUser = computed<User[]>(() => {
	if (type.value === 'All') return users.value;
	else return friends.value;
});

function changeUserStatus(data: string) {
	console.log(data);
}

onBeforeMount(() => {
	fetchUsers();
	fetchfriends();
	socket.on('statusChange', (data) => {
		changeUserStatus(data);
	});
});

onBeforeUnmount(() => {
	socket.off('statusChange', (data) => {
		changeUserStatus(data);
	});
});
</script>

<template>
	<base-ui>
		<div class="flex flex-col justify-between bg-slate-900 w-full h-1/4">
			<div class="flex flex-col w-full pt-3 px-3 sm:pt-5 sm:px-5 sm:flex-row h-full justify-between">
				<div class="flex items-center">
					<img src="@/assets/trophy.png" class="h-8 pr-2 sm:h-12" />
					<h1 class="text-lg sm:text-xl text-white">Leaderboard</h1>
				</div>
				<div class="flex items-center justify-center gap-4 pt-3 sm:pt-0">
					<form>
						<div class="relative">
							<div class="flex absolute inset-y-0 left-0 items-center pl-2 pointer-events-none">
								<svg aria-hidden="true" class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
							</div>
							<input type="search" class="block p-0.5 pl-8 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search User" required>
						</div>
					</form>
					<div class="flex items-center">
						<span class="text-slate-600 pr-2">All</span>
						<Toogle @switchButton="switchDysplayUsers"></Toogle>
						<span class="text-slate-600 pl-2">Friends</span>
					</div>
				</div>
			</div>
			<div class="flex justify-center items-center text-base sm:text-lg text-zinc-400 h-full sm:pb-3">
				<div class="text-center flex-1">
					<base-button @click="nameOrder()">Player</base-button>
				</div>
				<div class="text-center flex-1">
					<base-button @click="statusOrder()">Status</base-button>
				</div>
				<div class="text-center flex-1">
					<base-button @click="rankOrder()">Rank</base-button>
				</div>
			</div>
		</div>
		<div class="overflow-y-scroll h-3/4 bg-slate-900">
			<div v-if="isLoading" class="flex items-center justify-center h-full font-Arlon text-white text-6xl">Loading</div>
			<div v-else v-for="user in displayUser" :key="user.id" class="text-sm sm:text-base h-[calc(100%_/_4)] pb-3 px-3">
				<CardLeaderboard :user="user"></CardLeaderboard>
			</div>
		</div>
	</base-ui>
</template>
