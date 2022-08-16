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
            return 'text-lime-400'
        else
            return 'text-red-700'
    }
    else
    {
        if (side === 'player')
            return 'text-red-700'
        else
            return 'text-lime-400'
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
    <div class="flex flex-col justify-center items-center gap-4 max-h-full w-full overflow-y-auto">
        <h1 class="text-red-200 sm:text-xl text-center w-3/4 md:text-xl py-3 border-b-[1px] border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500">MATCH HISTORY</h1>
        <div v-if="matchsHistory.length" class="flex flex-col items-center gap-2 w-full overflow-y-auto">
            <div v-for="match in matchsHistory" :key="match.date" class="flex w-full">
                <p class="w-2/5 text-right text-sm sm:text-base md:text-lg" :class="colorText(match, 'player')">{{ createString(match, 'player') }}</p>
                <p class="w-1/5 text-center"> ⚔️ </p>
                <p class="w-2/5 text-left text-sm sm:text-base md:text-lg" :class="colorText(match, 'opponent')">{{ createString(match, 'opponent') }}</p>
            </div>
        </div>
        <p v-else class="flex items-center text-base sm:text-xl h-full text-red-300"> NO DATA</p> 
    </div>
</template>