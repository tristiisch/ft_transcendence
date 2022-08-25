<script setup lang="ts">
import ButtonReturnNext from '@/components/Chat/ButtonReturnNext.vue';
import { ref } from 'vue';

const imageTab = ref(['src/assets/pong1.jpeg', 'src/assets/pong2.jpg'] as string[])
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
    <div class="flex flex-col justify-center gap-2 sm:gap-4 w-3/4 text-red-200 pb-6">
        <p class="text-xs">BALL SPEED</p>
        <input id="small-range" type="range" value="50" class="mb-2 w-full h-0.5 rounded-lg appearance-none cursor-pointer range-sm bg-neutral-100">
        <p class="text-xs">RACKET SIZE</p>
        <input id="small-range" type="range" value="50" class="mb-2 w-full h-0.5 rounded-lg appearance-none cursor-pointer range-sm bg-neutral-100">
    </div>
    <div class="flex flex-col items-center w-full gap-4 3xl:gap-8">
        <h1 class="flex justify-center items-center w-3/4 h-[40px] sm:h-[50px] text-sm sm:text-base text-red-200 border-b border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500">CHOOSE WORLD</h1>
        <div class="flex justify-center w-full gap-3">
            <button @click=nextPrevious() class="flex items-center justify-center h-full cursor-pointer group focus:outline-none">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 border border-blue-600">
                    <svg class="w-3 h-3" fill="none" stroke="#2563EB" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    <span class="sr-only">Previous</span>
                </span>
            </button>
            <div class="flex items-center duration-700 ease-in-out">
                <img :src=imageTab[index] class="h-[calc(0.13_*_100vh)] w-[calc(0.23_*_100vh)] sm:h-[calc(0.18_*_100vh)] sm:w-[calc(0.28_*_100vh)] object-cover" alt="...">
            </div>
            <button @click=nextPrevious() class="flex items-center justify-center h-full cursor-pointer group focus:outline-none">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 border border-blue-600">
                    <svg class="w-3 h-3" fill="none" stroke="#2563EB" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    <span class="sr-only">Next</span>
                </span>
            </button>
        </div>
    </div>
</template>