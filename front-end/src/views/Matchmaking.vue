<script setup lang="ts">

import { ref, onBeforeMount, onMounted, onBeforeUnmount } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRoute, useRouter } from 'vue-router';
import useMatchService from '@/services/MatchService';
import socket from '@/plugin/socketInstance';
import ButtonGradient from '@/components/Button/ButtonGradient.vue';
import { useGlobalStore } from '@/stores/globalStore';
import { MatchMakingTypes } from '@/types/MatchMaking';
import UserService from '@/services/UserService';

const searchingMatch = ref(false)
const waitingForPlayer = ref(false)

const MatchService = useMatchService
const router = useRouter()
const route = useRoute()
const userStore = useUserStore();
const userData = userStore.userData
const globalStore = useGlobalStore()

function findMatch(type: number, match_live_infos: any) {
	searchingMatch.value = true
	socket.emit('findMatch', {type, custom_match_infos: match_live_infos})
	socket.on('foundMatch', (id) => {
		router.replace('match/' + id)
	})
}

onBeforeMount(() => {
	var custom_match_infos = null
	if (route.query.custom) {
		custom_match_infos = {
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
	<div v-if="!searchingMatch && !waitingForPlayer" class="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2">
		<button-gradient class="m-3 h-[50px]" style="width:180px" @click="findMatch(MatchMakingTypes.NORMAL_MATCH, null)">Normal Match</button-gradient>
		<button-gradient class="m-3 h-[50px]" style="width:180px" @click="findMatch(MatchMakingTypes.ANY_MATCH, null)">Any Match</button-gradient>
	</div>
	<div v-if="searchingMatch" class="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center">
		<base-spinner game></base-spinner>
		<button-gradient class="m-3 h-[50px]" style="width:180px" @click="router.push('/home')">Cancel</button-gradient>
	</div>
	<div v-if="waitingForPlayer" class="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center">
		<base-spinner invite></base-spinner>
		<button-gradient class="m-3 h-[50px]" style="width:180px" @click="router.push('/home')">Cancel</button-gradient>
	</div>
</template>