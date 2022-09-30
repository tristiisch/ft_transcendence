<script setup lang="ts">

import { ref, onBeforeMount, onMounted, onBeforeUnmount } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRoute, useRouter } from 'vue-router';
import useMatchService from '@/services/MatchService';
import socket from '@/plugin/socketInstance';
import ButtonGradient from '@/components/Button/ButtonGradient.vue';
import { useGlobalStore } from '@/stores/globalStore';
import { MatchMakingTypes } from '@/types/MatchMaking';
import TheHeader from '../components/Ui/TheHeader.vue';

const searchingMatch = ref(false)

const router = useRouter()
const route = useRoute()
const globalStore = useGlobalStore()

function findMatch(type: number, match_live_infos: any) {
	searchingMatch.value = true
	socket.emit('findMatch', {type, custom_match_infos: match_live_infos})
	socket.on('foundMatch', (id) => {
		searchingMatch.value = false
		socket.off('foundMatch')
		router.replace('match/' + id)
	})
}

onBeforeMount(() => {
	if (route.query.custom) {
		let custom_match_infos = {
			ballSpeed: globalStore.ballSpeed,
			racketSize: globalStore.racketSize,
			increaseBallSpeed: globalStore.increaseSpeed,
			world: globalStore.world,
			winningScore: globalStore.winningScore
		}
		searchingMatch.value = true
		findMatch(MatchMakingTypes.OWN_MATCH, custom_match_infos)
	}
})

onBeforeUnmount(() => {
	if (searchingMatch.value) {
		socket.emit('cancelFindMatch')
		socket.off('foundMatch')
	}
})

</script>

<template>
	<div class="relative flex flex-col justify-between h-full font-Noir mx-[4vw] gap-4">
		<the-header></the-header>
		<div v-if="!searchingMatch" class="flex flex-col justify-center items-center h-full w-full mb-40 gap-[44px]">
			<div class="flex flex-col sm:flex-row justify-center items-center">
				<button-gradient class="m-3 h-[50px]" style="width:180px" @click="findMatch(MatchMakingTypes.NORMAL_MATCH, null)">Normal Match</button-gradient>
				<button-gradient class="m-3 h-[50px]" style="width:180px" @click="findMatch(MatchMakingTypes.ANY_MATCH, null)">Any Match</button-gradient>
			</div>
			<base-button link :to="{ name: 'Home' }" type="button" class="m-3 h-[50px] w-[80px] sm:w-[130px] text-white bg-gradient-to-l 
				from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-r focus:ring-1 focus:outline-none focus:ring-purple-200 font-medium rounded-lg text-xs sm:text-sm py-3.5 text-center" 
				style="width:180px">Home</base-button>
		</div>
		<div v-if="searchingMatch" class="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center">
			<base-spinner game></base-spinner>
			<button-gradient class="-mt-16 h-[50px]" style="width:180px" @click="router.push('/home')">Cancel</button-gradient>
		</div>
	</div>
	<div class="h-full w-full fixed bg-brick bg-bottom bg-cover top-0 left-0 -z-20 [transform:_scale(1.2)]"></div>
</template>


 