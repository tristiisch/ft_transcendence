<script setup lang="ts">
import type MatchHistory from '@/types/MatchHistory';
import type User from '@/types/User';

defineProps<{
	user?: User,
	matchsHistory?: MatchHistory[]
}>()

function colorTextScore(value: MatchHistory) {
    if (value.won === true) { return 'text-lime-400' }
    else { return 'text-red-700' }
}

</script>

<template>
    <div class="flex flex-col justify-center items-center gap-4 sm:gap-7 min-h-[200px] max-h-full w-full overflow-y-auto">
       <h1 class="flex justify-center items-center w-3/4 h-[40px] sm:h-[50px] text-sm sm:text-base text-red-200 border-b border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500 shrink-0">MATCH HISTORY</h1>
        <div v-if="matchsHistory" class="flex flex-col items-center gap-1 sm:gap-1.5 w-full overflow-y-auto">
            <div v-for="match in matchsHistory" :key="match.date" class="flex w-full">
                <p class="w-2/5 text-right text-sm sm:text-lg" :class="colorTextScore(match)"><span class="text-xs sm:text-sm text-red-300">{{ user?.username }}</span><span class="text-red-300"> - </span>{{ match.score[0] === -1 ? 'FORFEIT' :  match.score[0] }}</p>
                <p class="w-1/5 text-center grayscale"> ⚔️ </p>
                <p class="w-2/5 text-left text-xs sm:text-sm text-red-300"><span class="text-sm sm:text-lg" :class="colorTextScore(match)">{{ match.score[1] === -1 ? 'FORFEIT' : match.score[1] }}</span><span class="text-red-300"> - </span>{{ match.opponent }}</p>
            </div>
        </div>
        <p v-else class="flex items-center text-base sm:text-xl h-full text-red-300"> NO DATA</p>
    </div>
</template>
