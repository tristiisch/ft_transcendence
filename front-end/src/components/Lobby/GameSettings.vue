<script setup lang="ts">
import ButtonReturnNext from '@/components/Chat/ButtonReturnNext.vue';
import { ref } from 'vue';

const imageTab = ref(['src/assets/TV.png', 'src/assets/inGame.png'] as string[])
const index = ref(0);

function nextPrevious() { 
	if(index.value === 0) index.value++
	else index.value--
}

const emit = defineEmits<{
	(e: 'next'): void,
}>()

</script>

<template>
    <div class="flex flex-col justify-center gap-2 w-3/4 pt-3 sm:pt-0 text-red-200">
        <p class="text-xs sm:text-sm">BALL SPEED</p>
        <input id="small-range" type="range" value="50" class="caret-white mb-2 w-full h-1 rounded-lg appearance-none cursor-pointer range-sm bg-red-300">
        <p class="text-xs sm:text-sm">RACKET SIZE</p>
        <input id="small-range" type="range" value="50" class="mb-2 w-full h-1 rounded-lg appearance-none cursor-pointer range-sm bg-red-300">
    </div>
    <div class="flex flex-col justify-around items-center w-full h-1/2">
        <h1 class="text-center text-red-200 text-sm sm:text-base w-3/4 sm:mx-6 h-[50px] md:text-xl py-3 border-b-[1px] border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500">CHOOSE WORLD</h1>
    </div>
    <div class="w-1/2 h-full">
        <div class="relative h-full rounded-lg">
            <div class="duration-700 ease-in-out">
                <img :src=imageTab[index] class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" alt="...">
            </div>
            <button @click=nextPrevious() class="absolute top-0 -left-20 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-1 group-focus:ring-white group-focus:outline-none">
                    <svg class="w-3 h-3" fill="none" stroke="#FECACA" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    <span class="sr-only">Previous</span>
                </span>
            </button>
            <button @click=nextPrevious() class="absolute top-0 -right-20 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-1 group-focus:ring-white group-focus:outline-none">
                    <svg class="w-3 h-3" fill="none" stroke="#FECACA" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    <span class="sr-only">Next</span>
                </span>
            </button>
        </div>
    </div>
    <button-return-next :side="'next'" @click="emit('next')" class="self-end"></button-return-next>
</template>