<script setup lang="ts">

import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import useMatchService from '@/services/MatchService';
import socket from '@/plugin/socketInstance';
import ButtonGradient from '@/components/Button/ButtonGradient.vue';

const searchingMatch = ref(false)

const MatchService = useMatchService
const router = useRouter()
const userStore = useUserStore();
const userData = userStore.userData

function findMatch(any: boolean) {
	searchingMatch.value = true
	socket.emit('findMatch', any)
	socket.on('foundMatch', (id) => {
		router.replace('match/' + id)
	})
}

</script>

<template>
	<div v-if="!searchingMatch" class="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2">
		<button-gradient class="m-3 h-[50px]" style="width:180px" @click="findMatch(false)">Normal Match</button-gradient>
		<button-gradient class="m-3 h-[50px]" style="width:180px" @click="findMatch(true)">Any Match</button-gradient>
	</div>
	<base-spinner game v-if="searchingMatch"></base-spinner>
</template>