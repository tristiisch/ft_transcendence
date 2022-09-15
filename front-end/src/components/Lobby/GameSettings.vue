<script setup lang="ts">
import { ref } from 'vue';

const imageTab = ref(['src/assets/pong1.jpeg', 'src/assets/pong2.jpg'] as string[])
const index = ref(0);
const ballSpeed = ref(55);
const racketSize = ref(5);

function nextPrevious() { 
	if(index.value === 0) index.value++
	else index.value--
}

const emit = defineEmits<{
	(e: 'next'): void,
}>()

</script>

<template>
    <div class="flex flex-col justify-center items-center gap-2 sm:gap-4 w-3/4 text-red-200 pb-4 h-full">
        <label class="text-xs">BALL SPEED</label>
        <div class="flex justify-center items-center gap-2 w-full relative">
            <span class="absolute -top-4 text-red-700 text-md">{{ ballSpeed }}</span>
            <span> 10 </span>
            <input v-model="ballSpeed" id="small-range" type="range" min="10" max="100" class="slider w-full h-0.5 bg-neutral-50 rounded-lg appearance-none cursor-pointer range-sm">
            <span> 100 </span>
        </div>
        <label class="text-xs">RACKET SIZE</label>
        <div class="flex justify-center items-center gap-2 w-full relative">
            <span class="absolute -top-4 text-red-700 text-md">{{ racketSize }}</span>
            <span> 30 </span>
            <input v-model="racketSize" id="small-range" type="range" min="30" max="70" class="slider w-full h-0.5 bg-neutral-50 rounded-lg appearance-none cursor-pointer range-sm">
            <span> 70 </span>
        </div>
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
                <img :src=imageTab[index] class="h-[calc(0.13_*_100vh)] w-[calc(0.23_*_100vh)] sm:h-[calc(0.16_*_100vh)] sm:w-[calc(0.26_*_100vh)] object-cover rounded-xl" alt="...">
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

<style>

.slider::-webkit-slider-thumb {
  -webkit-appearance: none; /* Override default look */
  appearance: none;
  width: 16px; /* Set a specific slider handle width */
  height: 16px; /* Slider handle height */
  background: #F5F5F5; /* Green background */
  border-radius: 50%;
  border: solid;
  border-color: #2563EB;
  border-width: 1px;
  cursor: pointer; /* Cursor on hover */
}

</style>