<script setup lang="ts">
import UsersService from '@/services/UserService';
import type Match from '@/types/MatchHistory';
import { ref, onMounted } from 'vue';
import CardLeft from '@/components/CardLeft.vue';
import CardRight from '@/components/CardRight.vue';
import CurrentGame from '@/components/Lobby/CurrentGame.vue';
import ButtonGradient2 from '@/components/ButtonGradient2.vue';
import ButtonPlus from '@/components/Chat/ButtonPlus.vue';
import AddSearchPlayer from '@/components/Chat/AddSearchPlayer.vue';
import GameSettings from '@/components/Lobby/GameSettings.vue';
import ButtonReturnNext from '@/components/Chat/ButtonReturnNext.vue';


const imageTab = ref(['src/assets/TV.png', 'src/assets/inGame.png'] as string[])

const matchs = ref([] as Match[]);
const index = ref(0);
const rightPartToDisplay = ref('gameSettings');
const mode = ref('random')
const invitation = ref(false)

function nextPrevious() { 
	if(index.value === 0) index.value++
	else index.value--
	}

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

function invitePlayer()
{
	rightPartToDisplay.value = 'selectPlayer'
	invitation.value = true
	
}

onMounted(() => {
	fetchUsers();
});
</script>


<template>
	<base-ui>
		<div class="flex flex-col h-full sm:flex-row">
			<card-left>
				<div class="flex justify-between items-center h-full flex-wrap sm:flex-col sm:flex-nowrap px-8 ">
					<h1 class="w-full text-center font-Arlon tracking-tight text-lg sm:text-xl pb-2 sm:pb-5 border-b-[1px] border-slate-700 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">CURRENT GAMES</h1>
					<current-game @next="rightPartToDisplay = 'invitePlayer'" :matchs="matchs"></current-game>
				</div>
			</card-left>
			<card-right title="CUSTOM GAME">
				<div class="flex flex-col items-center gap-4 w-11/12 px-8">
					<game-settings v-if="rightPartToDisplay === 'gameSettings'" @next="rightPartToDisplay = 'selectPlayer'"></game-settings>
					<div v-else-if="rightPartToDisplay === 'selectPlayer'" class="flex flex-col justify-between items-center gap-4 h-full w-full">
						<div class="flex flex-col justify-around items-center w-full">
							<h1 class="text-center text-red-200 text-sm sm:text-base w-3/4 sm:mx-6 h-[50px] md:text-xl py-3 border-b-[1px] border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500">PLAYERS</h1>
						</div>
						<div class="inline-flex justify-center w-full">
							<button @click="mode = 'random'" class="btn-base rounded-l-md border" :class="mode === '2FA' ? 'bg-blue-600 text-white' : 'bg-red-100 text-gray-800'">Random</button>
							<button @click="mode = 'invite'" class="btn-base rounded-r-md border-t border-b" :class="mode === 'Edit' ? 'bg-blue-600 text-white' : 'bg-red-100 text-gray-800'">Invite</button>
						</div>
						<div v-if="mode === 'invite'" class="flex flex-col justify-center items-center h-[100px] w-3/4 rounded bg-red-400">
							<div v-if="!invitation" class="flex items-center gap-2">
								<button-plus @click="rightPartToDisplay = 'invitePlayer'"></button-plus>
								<label class="text-red-200">Choose Player</label>
							</div>
							<div v-else class="flex items-center justify-evenly w-full text-red-200">
								invitation pending
								<div role="status">
									<svg class="inline mr-2 w-6 h-6 text-red-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
										<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
									</svg>
									<span class="sr-only">Loading...</span>
								</div>
							</div>
						</div>
						<div class="flex flex-col items-center w-3/4">
							<img src="@/assets/rocket.png" class="-mb-[30px] h-[200px] w-[200px]">
							<div class="flex w-full items-center gap-3">
								<button class="bg-red-200 py-2 w-full rounded">LAUNCH</button>
								<button-return-next :side="'previous'" @click="rightPartToDisplay = 'gameSettings'" class="self-end -mr-20"></button-return-next>
							</div>
						</div>
						
					</div>
					<add-search-player v-else-if="rightPartToDisplay === 'invitePlayer'" @validate="invitePlayer()" @close="rightPartToDisplay = 'selectPlayer'"></add-search-player>
				</div>
			</card-right>
		</div>
	</base-ui>
</template>


<style scoped>
.btn-base {
	@apply w-[38%] py-2 px-4 text-xs sm:text-sm border-red-100 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white;
}
</style>