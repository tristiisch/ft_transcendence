<script setup lang="ts">

import { onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import useMatchService from '@/services/MatchService';

const MatchService = useMatchService
const router = useRouter()
const userStore = useUserStore();
const userData = userStore.userData

function findMatch() {
	MatchService.findMatch()
		.then((response) => {
			router.push('match/' + response.data)
		})
		.catch((e) => {
			router.push('match/' + 1)
			console.log("couldn't find a match")
		});
}

onMounted(() => {
	findMatch()
})

</script>

<template>
	<h1>Searching</h1>
</template>