<script setup lang="ts">
import type Match from '@/types/Match';
const props = defineProps<{
  matchs: Match[]
}>()
</script>


<template>
    <div class="w-full overflow-y-auto h-[75px] sm:h-full mt-6">
        <div v-for="match in matchs" :key="match.timestamp_started" class="w-full h-[60px] sm:mt-[14px] grid [grid-template-columns:_3fr_1fr_2fr_1fr_3fr] auto-cols-min place-content-center items-center">
            <div class="flex flex-col justify-between items-center h-full shrink-0 text-slate-700">
                <img class="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover border-[1px] border-slate-300" :src=match.user1_avatar alt="Rounded avatar">
                <span class="text-xs">{{ match.user1_username }}</span>
            </div>
            <div class="text-center text-xs lg:text-sm text-slate-500">
                {{ match.score[0] }}
            </div>
            <div class="flex flex-col justify-end gap-1 items-center h-full">
                <button class="inline-flex items-center justify-center p-[1px] overflow-hidden text-xxs lg:text-xs text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-1 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800">
                    <span class="text-slate-300 px-1.5 py-1.5 transition-all ease-in duration-75 bg-slate-900 rounded-md group-hover:bg-opacity-0 hover:text-neutral-100">
                    WATCH
                    </span>
                </button>
                <span class="text-slate-700 text-xs lg:text-sm">VS</span>
            </div>
            <div class="text-center text-xs lg:text-sm text-slate-500">
                {{ match.score[1] }}
            </div>
            <div class="flex flex-col justify-between items-center h-full shrink-0 text-slate-700">
                <img class="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover border-[1px] border-slate-300" :src=match.user2_avatar alt="Rounded avatar">
                <span class="text-xs">{{ match.user2_username }}</span>
            </div>
        </div>
    </div>
</template>
