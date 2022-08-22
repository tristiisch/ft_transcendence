<script setup lang="ts">
import UserService from '@/services/UserService';
import type User from '@/types/User';
import { ref, computed, onBeforeMount, onBeforeUnmount } from 'vue';
import { useUserStore } from '@/stores/userStore';
import Toogle from '@/components/Leaderboard/ToogleButton.vue';
import CardLeaderboard from '@/components/Leaderboard/CardLeaderboard.vue';
import socket from '@/plugin/socketInstance';
import { useToast } from 'vue-toastification';

const userStore = useUserStore();
const toast = useToast();
const users = ref<User[] | null>(null);
const friends = ref<User[] | null>(null);
const error = ref('')
const type = ref('All');

function rankOrder() {
	if (type.value === 'All') {
		users.value?.sort((a, b) => {
			return a.rank - b.rank;
		});
	} else {
		friends.value?.sort((a, b) => {
			return a.rank - b.rank;
		});
	}
}

function nameOrder() {
	if (type.value === 'All') {
		users.value?.sort((a, b) => {
			let fa = a.username;
			let fb = b.username;
			if (fa < fb) return -1;
			if (fa > fb) return 1;
			return 0;
		});
	} else {
		friends.value?.sort((a, b) => {
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
		users.value?.sort((a, b) => {
			return b.status - a.status;
		});
	} else {
		friends.value?.sort((a, b) => {
			return b.status - a.status;
		});
	}
}

function fetchUsers() {
	UserService.getUsers()
		.then((response) => {
			console.log(response.data)
			users.value = response.data;
		})
		.catch((e) => {
			error.value = e.response.data.message
			toast.error(error.value);
		});
	rankOrder();
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
		type.value = 'Friends';
		type.value = 'All';
	}
}

const displayUser = computed(() => {
	if (type.value === 'All') return users.value;
	else return friends.value;
});

function changeUserStatus(data: string) {
	console.log(data);
}

const isLoading = computed(() => {
	console.log(friends.value)
	if (friends.value && users.value || error.value !== '')
		return false;
	return true;
});

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
	<base-ui :isLoading="isLoading">
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
								<svg aria-hidden="true" class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
							</div>
							<input type="search" class="block p-0.5 pl-8 w-full text-sm text-white placeholder:text-slate-600 bg-slate-800 rounded-lg border border-slate-500 focus:ring-blue-500 focus:border-blue-500" placeholder="Search User" required>
						</div>
					</form>
					<div class="flex items-center">
						<span class="text-slate-700 pr-2">All</span>
						<Toogle @switchButton="switchDysplayUsers"></Toogle>
						<span class="text-slate-700 pl-2">Friends</span>
					</div>
				</div>
			</div>
			<div class="grid [grid-template-columns:_2fr_1fr_1fr] items-end text-base sm:text-lg text-slate-700 h-full sm:pb-3 px-3">
					<base-button @click="nameOrder()">Player</base-button>
					<base-button @click="statusOrder()" class="flex">Status</base-button>
					<base-button @click="rankOrder()">Rank</base-button>
			</div>
		</div>
		<div class="overflow-y-scroll h-3/4 bg-slate-900">
			<div v-for="user in displayUser" :key="user.id" class="text-sm sm:text-base h-[calc(100%_/_4)] 3xl:h-[calc(100%_/_5)] pb-3 px-3">
				<CardLeaderboard :user="user"></CardLeaderboard>
			</div>
		</div>
	</base-ui>
</template>
