<script setup lang="ts">
import type Match from '@/types/MatchHistory';
const props = defineProps<{
  matchs: Match[]
}>()
</script>


<template>
    <div class="flex flex-col justify-start gap-3 items-center w-full flex-wrap order-2 overflow-y-auto max-h-[60px] sm:max-h-[400px] sm:flex-nowrap sm:order-none border-b-[1px] border-slate-700 pt-4">
        <div v-for="match in matchs" :key="match.date" class="flex justify-center gap-5 items-center w-full h-[60px]">
            <div class="flex flex-col justify-between items-center shrink-0 text-slate-700">
                <img class="w-10 h-10 rounded object-cover border-[1px] border-zinc-300" src="@/assets/obama.jpeg" alt="Rounded avatar">
                <span class="text-xs sm:text-sm">Robert</span>
            </div>
            <div class="text-slate-500">
                1
            </div>
            <div class="flex flex-col justify-end gap-1 items-center h-full">
                <button class="inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800">
                    <span class="text-slate-300 px-2 py-1.5 transition-all ease-in duration-75 bg-slate-900 rounded-md group-hover:bg-opacity-0 hover:text-white">
                    WATCH
                    </span>
                </button>
                <span class="text-slate-700 text-xs sm:text-sm">VS</span>
            </div>
            <div class="text-slate-500">
                0
            </div>
            <div class="flex flex-col justify-between items-center h-full shrink-0 text-slate-700">
                <img class="w-10 h-10 rounded object-cover border-[1px] border-zinc-300" src="@/assets/obama.jpeg" alt="Rounded avatar">
                <span class="text-xs sm:text-sm">Igor</span>
            </div>
        </div>
    </div>
</template>