<script setup lang="ts">
import UsersService from '@/services/UserService';
import type Match from '@/types/MatchHistory';
import { ref, onMounted } from 'vue';
import CardLeft from '@/components/CardLeft.vue';
import CardRight from '@/components/CardRight.vue';
import CurrentGame from '@/components/Lobby/CurrentGame.vue';
import ButtonGradient2 from '@/components/ButtonGradient2.vue';
import RankCard from '@/components/Profile/RankCard.vue';


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
		<div class="flex flex-col h-full sm:flex-row">
			<card-left>
				<div class="flex justify-around items-center h-full flex-wrap pb-2 sm:flex-col sm:justify-between sm:flex-nowrap">
					<h1 class="font-Arlon tracking-tight text-2xl sm:text-3xl pb-10 sm:border-b-[1px] sm:border-slate-700 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">CURRENT GAMES</h1>
					<div class="flex flex-col justify-center items-center w-full sm:h-full">
						<current-game :matchs="matchs"></current-game>
					</div>
				</div>
			</card-left>
			<card-right title="CUSTOM GAME">
				<div class=" flex flex-col justify-evenly items-center gap-4 w-11/12">
					<div class="flex flex-col justify-center gap-2 w-3/4 pt-3 sm:pt-0">
						<p class="text-xs md:text-sm xl:text-base">BALL SPEED</p>
						<input id="small-range" type="range" value="50" class="mb-3 sm:mb-5 w-full h-[3px] sm:h-1 rounded-lg appearance-none cursor-pointer range-SM bg-gray-700">
						<p class="text-xs md:text-sm xl:text-base">RACKET SIZE</p>
						<input id="small-range" type="range" value="50" class="mb-3 sm:mb-5 w-full h-[3px] sm:h-1 rounded-lg appearance-none cursor-pointer range-sm bg-gray-700">
					</div>
					<div class="flex flex-col justify-around items-center w-full h-1/2">
						<h1 class="text-center text-red-200 text-sm sm:text-base w-3/4 sm:mx-6 h-[50px] md:text-xl py-3 border-b-[1px] border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500">CHOOSE WORLD</h1>
						<div class="flex justify-center w-full md:gap-4">
							<div class="w-28 h-24 sm:w-32 sm:h-28 md:w-36 md:h-32  bg-sky-200"></div>
							<div class="w-28 h-24 sm:w-32 sm:h-28 md:w-36 md:h-32  bg-black"></div> 
						</div>
					</div>
					<button-gradient2 class="flex justify-center mb-4 sm:mb-0 sm:mt-4 sm:w-3/4">
						<span class="text-sm sm:text-base md:text-lg xl:text-xl">LAUNCH</span>
					</button-gradient2>
				</div>	
			</card-right>
		</div>
	</base-ui>
</template>