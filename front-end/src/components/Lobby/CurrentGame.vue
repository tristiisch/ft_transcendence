<script setup lang="ts">
import type Match from '@/types/Match';
const props = defineProps<{
  matchs: Match[]
}>()
</script>

<template>
    <div id="scrollbar" class="w-full overflow-y-auto h-full pt-4">
        <div v-for="match in matchs" :key="match.timestamp_started" class="flex w-full h-full sm:h-[calc(100%_/_5)] 3xl:h-[calc(100%_/_6)]">
            <base-button link :to="{ name: 'Profile', params: { id: match.user1_id }}" class="flex flex-col items-center gap-2 h-full text-slate-600 w-[40%] pr-4">
                <img class="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover border-[1px] border-slate-300" :src=match.user1_avatar alt="Rounded avatar">
                <span class="text-xs text-center w-full truncate">{{ match.user1_username }}</span>
            </base-button>
            <div class="flex flex-col items-center gap-2 h-full w-[20%]">
                <base-button link :to="{ name: 'Match', params: { uuid: match.id }}" class="inline-flex items-center justify-center p-[1px] overflow-hidden text-xxxs lg:text-xs text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white focus:ring-1 focus:outline-none focus:ring-purple-200">
                    <span class="text-slate-300 px-1.5 py-1.5 transition-all ease-in duration-75 bg-slate-900 rounded-md group-hover:bg-opacity-0 hover:text-neutral-100">
                    WATCH
                    </span>
                </base-button>  
                <div class="flex items-center gap-2">    
                    <div class="text-neutral-100">{{ match.score[0] }}</div>         
                    <span class="text-slate-700 text-xs lg:text-sm">VS</span>
                    <div class="text-neutral-100">{{ match.score[1] }}</div>
                </div> 
            </div>
            <base-button link :to="{ name: 'Profile', params: { id: match.user2_id }}" class="flex flex-col items-center gap-2 h-full text-slate-600 w-[40%] pl-4">
                <img class="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover border-[1px] border-slate-300" :src=match.user2_avatar alt="Rounded avatar">
                <span class="text-xs w-full text-center truncate">{{ match.user2_username }}</span>
            </base-button>
        </div>
    </div>
</template>

<style>
#scrollbar::-webkit-scrollbar-track
{
	-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
	box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
	background-color: transparent;
	background-clip: content-box; 
}

#scrollbar::-webkit-scrollbar
{
	width: 5px;
	background-color: transparent;
}

#scrollbar::-webkit-scrollbar-thumb
{
	background-color: #334155;
}
</style>