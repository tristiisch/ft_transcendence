<script setup lang="ts">
import UsersService from '@/services/UserService';
import type User from '@/types/User';
import { useUserStore } from '@/stores/userStore';
import { watch, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Status from '@/types/Status';

const userStore = useUserStore();
const route = useRoute();
const user = ref<User>();

async function fetchUser(name: string) {
	return await UsersService.getUserInfo(route.params.username as string)
		.then((response) => {
			user.value = response.data;
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

async function fetchMatchHistory(UserName: string, nbMatch: number) {
	return await UsersService.getUserInfo(route.params.id as string)
		.then((response) => {
			user.value = response.data;
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

function isOnline() {
	return user.value?.current_status === Status.ONLINE ? true : false;
}

function isInGame() {
	return user.value?.current_status === Status.INGAME ? true : false;
}

watch(
	() => route.params.username,
	() => {
		fetchUser(route.params.username as string);
	}
);

onMounted(() => {
	if (route.params.username === userStore.getUsername) {
		user.value = userStore.getUser;
	} else {
		fetchUser(route.params.username as string);
	}
});

defineExpose({
	user,
});
</script>

<template>
	<div class="flex flex-col justify-between h-full font-Noir">
		<the-header :isProfilePage="true"></the-header>
		<div
			class="flex flex-col justify-center sm:flex-row min-w-full xl:min-w-0 xl:w-4/6 self-center min-h-[420px] md:min-h-[488px] xl:min-h-[552px] [box-shadow:_0_0_20px_rgba(0,_0,_0,_0.8)]"
		>
			<div class="flex justify-around items-center gap-2 min-h-[168px] bg-slate-900 sm:w-2/5 sm:flex-col sm:justify-evenly">
				<div class="flex flex-col justify-around items-center gap-2 pl-3 sm:pl-0 sm:max-w-full ">
					<img class="w-20 h-20 rounded-full object-cover border-2 sm:w-28 sm:h-28 md:w-36 md:h-36" :src="user?.avatar" alt="Rounded avatar" />
					<div class="flex justify-center items-center gap-2">
						<img v-if="isInGame()" src="../assets/inGame.png" class="h-6 sm:h-10 pr-2" />
						<span v-else-if="isOnline()" class="w-2 h-2 rounded-full bg-green-400 sm:h-3 sm:w-3 md:h-4 md:w-4"></span>
						<span v-else class="w-2 h-2 rounded-full bg-red-600 sm:h-3 sm:w-3 md:h-4 md:w-4"></span>
						<span class="text-xl md:text-3xl">{{ user?.username }}</span>
					</div>
				</div>
				<div class="flex flex-col gap-4">
					<base-button
						class="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-xs px-3 py-2 sm:px-5 md:text-sm md:px-8 sm:py-2.5 text-center"
						>Add Friend</base-button
					>
					<base-button
						class="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-xs px-3 py-2 sm:px-5 md:text-sm md:px-8 sm:py-2.5"
						>Message</base-button
					>
				</div>
				<div class="flex flex-col items-center self-start h-16 w-12 rounded-b-lg bg-black sm:rounded-r-lg sm:flex-row sm:w-20 sm:h-12 md:h-16 md:w-28">
					<img src="../assets/rank_logo.png" class="h-10 w-10 mt-1 sm:mt-0 sm:ml-2 sm:h-12 sm:w-12 md:h-14 md:w-14" />
					<base-button link to="/leaderboard">
						<p class="text-white text-lg md:text-3xl">{{ user?.rank }}</p>
					</base-button>
				</div>
			</div>
			<div class="flex flex-col justify-center items-center gap-5 sm:gap-10 w-full sm:w-3/5 min-h-[252px] sm:max-h-full bg-red-500">
				<div class="w-4/5 h-1/4">
					<div class="flex justify-around items-center h-full w-full [box-shadow:_0_2px_8px_rgba(0,_0,_0,_0.26)]">
						<img src="../assets/trophy.png" class="h-10 sm:h-16 md:h-20" />
						<div>
							<h2 class="text-base sm:text-lg md:text-xl">WIN:</h2>
							<h1 class="text-lime-400 text-2xl sm:text-4xl md:text-6xl">{{ user?.nbVictory }}</h1>
						</div>
						<div>
							<h2 class="text-base sm:text-lg md:text-xl">LOSSES:</h2>
							<h1 class="text-red-400 text-2xl sm:text-4xl md:text-6xl">{{ user?.nbDefeat }}</h1>
						</div>
					</div>
				</div>
				<div class="w-4/5 h-1/2">
					<div class="flex flex-col items-center gap-3 overflow-y-auto h-full w-full [box-shadow:_0_2px_8px_rgba(0,_0,_0,_0.26)]">
						<h1 class="text-white text-lg py-3 sm:text-xl sm:py-5 md:text-3xl md:py-6">MATCH HISTORY</h1>
						<div class="v-for=">
							<p class="text-lime-400 text-sm sm:text-lg md:text-xl">(10 | 8) - WON AGAINST TOTO</p>
							
						</div>
					</div>
				</div>
			</div>
		</div>
		<the-footer></the-footer>
	</div>
	<div class="background"></div>
</template>

<style scoped>
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
	z-index: -100;
}
</style>
