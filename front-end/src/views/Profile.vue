<script setup lang="ts">
import UsersService from '@/services/UserService';
import type User from '@/types/User';
import { useUserStore } from '@/stores/userStore';
import { watch, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const userStore = useUserStore();
const route = useRoute();
const user = ref({} as User);

async function fetchUser(name: string) {
	return await UsersService.get(route.params.id as string)
		.then((response) => {
			user.value = response.data;
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

watch(
	() => route.params.id,
	() => {
		fetchUser(route.params.id as string);
	}
);

onMounted(() => {
	if (parseInt(route.params.id as string) === userStore.getId) {
		user.value = userStore.getUser;
	} else {
		fetchUser(route.params.id as string);
	}
});

defineExpose({
	user,
});
</script>

<template>
	<div class="flex flex-col justify-between h-full font-Noir">
		<the-header :isProfilePage="true" class="h-1/6"></the-header>
		<div class="flex flex-col justify-center sm:flex-row min-w-full xl:min-w-0 xl:w-4/6 self-center min-h-[420px] md:min-h-[488px] xl:min-h-[552px] [box-shadow:_0_0_20px_rgba(0,_0,_0,_0.8)]">
			<div class="relative flex flex-col items-center w-full sm:w-2/5 bg-slate-900">
				<div class="absolute flex flex-col justify-center items-center h-16 w-12 left-6 rounded-b-lg bg-black sm:left-0 sm:rounded-r-lg sm:flex-row sm:bottom-12   sm:w-32">
					<img src="../assets/rank_logo.png" class="h-10 w-10 sm:h-20 sm:w-20" />
					<p class="text-white text-lg sm:text-3xl">{{ user?.rank }}</p>
				</div>
				<img class="w-20 h-20 sm:w-36 sm:h-36 mt-4 rounded-full object-cover border-2 sm:mt-10" :src="user?.avatar" alt="Rounded avatar" />
				<h1 class="text-xl py-3 sm:text-3xl">{{ user?.username }}</h1>
			</div>
			<div class="flex flex-col justify-evenly items-center w-full sm:w-3/5 h-full bg-red-500">
				<div class="w-4/5 h-2/5">
					<div class="flex justify-around items-center h-full w-full [box-shadow:_0_2px_8px_rgba(0,_0,_0,_0.26)]">
						<img src="../assets/trophy.png" class="h-10 sm:h-20" />
						<div>
							<h2 class="sm:text-xl">WIN:</h2>
							<h1 class="text-lime-400 text-2xl sm:text-6xl">{{ user?.nbVictory }}</h1>
						</div>
						<div>
							<h2 sm:text-xl>LOSSES:</h2>
							<h1 class="text-red-400 text-2xl sm:text-6xl">{{ user?.nbDefeat }}</h1>
						</div>
					</div>
				</div>
				<div class="w-4/5 h-2/5">
					<div class="flex flex-col items-center h-full w-full [box-shadow:_0_2px_8px_rgba(0,_0,_0,_0.26)]">
						<div>
							<h1 class="text-white py-2 sm:py-6sm:text-3xl">MATCH HISTORY</h1>
						</div>
						<p class="text-lime-400 text-sm sm:text-xl">(10 | 8) - WON AGAINST TOTO</p>
					</div>
				</div>
			</div>
		</div>
		<the-footer class="h-1/6"></the-footer>
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
