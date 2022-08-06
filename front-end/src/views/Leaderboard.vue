<script setup lang="ts">
import UsersService from '@/services/UserService';
import type User from '@/types/User';
import { ref, onMounted, computed, onBeforeMount, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import Toogle from '@/components/Leaderboard/ToogleButton.vue'
import CardLeaderboard from '@/components/Leaderboard/CardLeaderboard.vue'

const userStore = useUserStore();
const users = ref([] as User[]);
const friends = ref([] as User[]);
const type = ref<string>('All');

function rankOrder() {
	if (type.value === 'All')
	{
		users.value.sort((a, b) => {
		return a.rank - b.rank;
		});
	}
	else
	{
		friends.value.sort((a, b) => {
		return a.rank - b.rank;
		});
	}
}

function nameOrder() {
	if (type.value === 'All')
	{
		users.value.sort((a, b) => {
		let fa = a.username
        let fb = b.username
		if (fa < fb)
			return -1;
		if (fa > fb)
			return 1;
		return 0;
		});
	}
	else
	{
		friends.value.sort((a, b) => {
		let fa = a.username
        let fb = b.username
		if (fa < fb)
			return -1;
		if (fa > fb)
			return 1;
		return 0;
		});
	}
}

function statusOrder() {
	if (type.value === 'All')
	{
		users.value.sort((a, b) => {
		return b.current_status - a.current_status;
		});
	}
	else
	{
		friends.value.sort((a, b) => {
		return b.current_status - a.current_status;
		});
	}
}

async function fetchUsers() {
	await UsersService.getUsers()
		.then((response) => {
			users.value = response.data;
		})
		.catch((e: Error) => {
			console.log(e);
		});
		rankOrder()
}

async function fetchfriends() {
	await UsersService.getUserfriends(userStore.userData.username)
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

onMounted(() => {
	fetchUsers();
	fetchfriends();
});
</script>

<template>
	<base-ui>
		<div class="flex flex-col justify-between bg-slate-900 w-full h-1/4">
			<div class="flex justify-between items-center h-3/5">
				<div class="flex items-center sm:mt-4">
					<img src="@/assets/trophy.png" class="h-8 sm:h-14 mx-3 sm:mx-6" />
					<h1 class="text-xl md:text-2xl text-white">Leaderboard</h1>
				</div>
				<div class="mr-5 mb-2 self-end">
					<div class="flex justify-center items-center">
						<span class="text-slate-600 pr-2">All</span>
						<Toogle @switch-button="switchDysplayUsers"></Toogle>
						<span class="text-slate-600 pl-2">Friends</span>
					</div>
				</div>
			</div>
			<div class="flex justify-center items-center text-base sm:text-lg text-zinc-400 pb-3">
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
			<div v-for="user in displayUser" :key="user.id" class="text-sm sm:text-base h-[calc(100%_/_4)] pb-3 px-3">
				<CardLeaderboard :user="user"></CardLeaderboard>
			</div>
		</div>
	</base-ui>
</template>
