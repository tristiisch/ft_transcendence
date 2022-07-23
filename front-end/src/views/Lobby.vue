<script setup lang="ts">
import UsersService from '@/services/UserService';
import type Match from '@/types/Match';
import { ref, onMounted } from 'vue';
import CardLeft from '@/components/CardLeft.vue';
import CardRight from '@/components/CardRight.vue';
import CurrentGame from '@/components/Lobby/CurrentGame.vue';


const matchs = ref([] as Match[]);

async function fetchUsers() {
	return await UsersService.getCurrentMatchs()
		.then((response) => {
			matchs.value = response.data;
			console.log(matchs.value);
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

onMounted(() => {
	fetchUsers();
});
</script>


<template>
	<base-ui>
		<card-left>
				<div class="relative flex flex-col justify-center items-center h-full w-full">
					<current-game :matchs="matchs"></current-game>
					<div class="flex flex-col justify-center items-center gap-3  h-[40%] w-full">
						<button class="flex justify-center items-cente w-1/2 rounded-[20px] bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-bl">
							<img src="@/assets/inGame.png" class="h-20 w-20">
						</button>
					</div>
				</div>
		</card-left>
		<card-right title="CUSTOM GAME">
			<div class=" flex flex-col justify-evenly items-center gap-4 w-full h-3/4">
				<div class="flex flex-col justify-center gap-2 w-3/4 h-2/5">
					<p>BALL SPEED</p>
					<input id="small-range" type="range" value="50" class="mb-6 w-full h-1 rounded-lg appearance-none cursor-pointer range-sm bg-gray-700">
					<p>RACKET SIZE</p>
					<input id="small-range" type="range" value="50" class="mb-6 w-full h-1 rounded-lg appearance-none cursor-pointer range-sm bg-gray-700">
				</div>
				<h1 class="text-center text-red-200 sm:text-xl mx-6 h-[20%] md:text-xl py-3 border-b-[1px] border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500">CHOOSE WORLD</h1>
				<div class="flex justify-evenly h-3/4 w-4/5 gap-4">
					<div class="w-1/2 h-full bg-sky-200"></div>
					<div class="w-1/2 h-full bg-black"></div>
				</div>
			</div>	
		</card-right>
	</base-ui>
	<div class="background"></div>
</template>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Righteous&display=swap');
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

</style>