<script setup lang="ts">
import UsersService from '@/services/UserService';
import type  Match from '@/types/Match';
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';

const route = useRoute();

const matchsHistory = ref({} as Match);

async function fetchMatchsHistory() {
	return await UsersService.getMatchsHistory()
		.then((response) => {
			matchsHistory.value = response.data;
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

onMounted(() => {
	fetchMatchsHistory()
});
</script>

<template>
    <div class="flex flex-col justify-center items-center gap-5 h-full">
        <h1 class="text-center text-red-200 sm:text-xl mx-6 w-3/4 md:text-xl py-3 border-b-[1px] border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500">MATCH HISTORY</h1>
        <div class="flex flex-col items-center gap-3 overflow-y-auto max-h-[180px] w-full">
            <div v-for="match in matchsHistory" :key="matchsHistory.id">
                <p class="text-lime-400 text-sm sm:text-base md:text-lg">(10 | 8) - WON AGAINST TOTO</p>
                <!-- <p class="text-lime-400 text-sm sm:text-base md:text-lg">(10 | 8) - WON AGAINST TOTO</p> -->
            </div>
        </div>
    </div>
</template>