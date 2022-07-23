<script setup lang="ts">
import UsersService from '@/services/UserService';
import type User from '@/types/User';
import { ref, onMounted, computed, onBeforeMount, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const users = ref([] as User[]);
const friends = ref([] as User[]);
const type = ref<string>('All');

async function fetchUsers() {
	await UsersService.getUsers()
		.then((response) => {
			users.value = response.data;
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

async function fetchfriends() {
	await UsersService.getUserfriends(userStore.getUsername)
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
	<div class="flex flex-col justify-between h-full font-Noir mx-[8vw]">
		<the-header></the-header>
		<div class="flex flex-col justify-center items-center">
			<div class="flex-col justify-center min-w-full xl:min-w-0 xl:w-4/6 rounded-t-lg bg-slate-900 [box-shadow:_0_0_20px_rgba(0,_0,_0,_0.8)]">
				<div class="flex flex-col justify-around bg-slate-900 rounded-t-lg h-26">
					<div class="flex justify-between items-center">
						<div class="flex items-center">
							<img src="@/assets/trophy.png" class="h-20 ml-4 p-4" />
							<h1 class="text-xl md:text-2xl text-white">Leaderboard</h1>
						</div>
						<div class="mr-10">
							<p>Show</p>
							<base-button :class="{ button_selected: type === 'Friends' }" @click="switchDysplayUsers">Friends</base-button>
							<base-button :class="{ button_selected: type === 'All' }" @click="switchDysplayUsers">All</base-button>
						</div>
					</div>
					<div class="flex justify-center items-center text-base sm:text-lg text-zinc-400">
						<div class="text-center flex-1">Player</div>
						<div class="text-center flex-1">Status</div>
						<div class="text-center flex-1">Rank</div>
					</div>
				</div>
				<div v-for="user in displayUser" :key="user.id" class="overflow-y-auto max-h-[316px] md:max-h-[380px] xl:max-h-[444px] text-sm sm:text-base">
					<div
						class="relative grid grid-flow-col auto-cols-fr place-content-center h-16 md:h-20 xl:h-24 myshadow2 m-3 overflow-hidden bg-gradient-to-r from-red-400 to-blue-500 hover:from-green-500 hover:to-lime-200"
					>
						<img class="absolute -left-6 -top-3 h-24 w-24 md:-left-8 md:-top-4 md:w-36 md:h-36 rounded-full object-cover" :src="user.avatar" alt="Rounded avatar" />
						<div class="flex items-center pl-20 md:pl-32">
							<base-button link :to="{ name: 'Profile', params: { username: user.username } }">{{ user.username }}</base-button>
						</div>
						<div class="flex justify-center items-center">
							<div class="h-2.5 w-2.5 rounded-full bg-green-400 mr-2"></div>
							{{ user.current_status }}
						</div>
						<div class="flex justify-center items-center">1</div>
					</div>
				</div>
			</div>
		</div>
		<the-footer></the-footer>
	</div>
	<div class="background"></div>
</template>

<style>
.background {
	top: 0;
	left: 0;
	position: fixed;
	margin: 0;
	background-image: url(@/assets/brick.jpg);
	background-size: cover;
	background-repeat: no-repeat;
	background-position: bottom;
	background-attachment: fixed;
	height: 100%;
	width: 100%;
	transform: scale(1.2);
	/*background: radial-gradient(ellipse farthest-corner at center top, #f39264 0%, #f2606f 100%);*/
	z-index: -100;
}

.button_selected {
	background-color: red;
	color: white;
}
.myshadow {
	box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
}

.myshadow2 {
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}
</style>
