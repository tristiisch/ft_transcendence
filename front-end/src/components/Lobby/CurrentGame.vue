<script setup lang="ts">
import type Match from '@/types/MatchHistory';
const props = defineProps<{
  matchs: Match[]
}>()
</script>


<template>
    <div class="flex flex-col justify-start items-center sm:gap-4 flex-wrap order-2 w-3/4 overflow-y-auto max-h-[70px] md:max-h-[248px] xl:max-h-[260px] 3xl:max-h-[352px] sm:flex-nowrap sm:order-none">
        <div v-for="match in matchs" :key="match.id" class="flex justify-around items-center w-full">
            <div class="flex flex-col justify-between items-center h-full">
                <img class="w-12 h-12 rounded-full object-cover border-[1px] border-zinc-300" src="@/assets/obama.jpeg" alt="Rounded avatar">
                <span class="text-xs sm:text-sm md:text-base xl:text-lg">Robert</span>
            </div>
            <div class="flex flex-col justify-end gap-1 items-center h-full">
                <button class="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800">
                    <span class="relative px-3 py-2 transition-all ease-in duration-75 bg-slate-900 rounded-md group-hover:bg-opacity-0">
                    WATCH
                    </span>
                </button>
                <span class="text-sm sm:text-base md:text-lg">VS</span>
            </div>
            <div class="flex flex-col justify-between items-center h-full">
                <img class="w-12 h-12 rounded-full object-cover border-[1px] border-zinc-300" src="@/assets/obama.jpeg" alt="Rounded avatar">
                <span class="text-xs sm:text-sm md:text-base xl:text-lg">Igor</span>
            </div>
        </div>
    </div>
</template>