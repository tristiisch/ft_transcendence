<script setup lang="ts">
import UsersService from '@/services/UserService';
import type  Match from '@/types/MatchHistory';
import { useRoute } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import type MatchHistory from '@/types/MatchHistory';
import { useUserStore } from '@/stores/userStore';

const route = useRoute();
const userStore = useUserStore();
const matchsHistory = ref([] as MatchHistory[]);

function createString(value: MatchHistory, side:string)
{
    if (side === 'player')
        return  route.params.username + ' - ' + value.score[0]
    else
        return  value.score[1] + ' -  ' + value.opponent
}

function colorText(value:MatchHistory, side:string) {
    if (value.result === 'won')
    {
        if (side === 'player')
            return 'text-red-800'
        else
            return 'text-red-300'
    }
    else
    {
        if (side === 'player')
            return 'text-red-300'
        else
            return 'text-red-800'
    }
}


async function fetchMatchsHistory() {
	return await UsersService.getMatchsHistory(route.params.username as string)
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
        <div class="flex flex-col items-center gap-2 overflow-y-auto max-h-[180px] w-full">
            <div v-for="match in matchsHistory" :key="match.date" class="flex w-full">
                <p class="w-2/5 text-right text-sm sm:text-base md:text-lg" :class="colorText(match, 'player')">{{ createString(match, 'player') }}</p>
                <p class="w-1/5 text-center"> ⚔️ </p>
                <p class="w-2/5 text-left text-sm sm:text-base md:text-lg" :class="colorText(match, 'opponent')">{{ createString(match, 'opponent') }}</p>
            </div>
        </div>
    </div>
</template>