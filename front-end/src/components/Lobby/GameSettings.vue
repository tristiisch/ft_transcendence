<script setup lang="ts">
import { useGlobalStore } from '@/stores/globalStore';
import { ref } from 'vue';
import Toogle from '@/components/Divers/ToogleButton.vue';

const globalStore = useGlobalStore();

const emit = defineEmits<{
	(e: 'next'): void,
}>()

</script>

<template>
	<h1 class="flex justify-center items-center shrink-0 w-3/4 h-[30px] sm:h-[50px] text-sm sm:text-base text-red-200 border-b border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500">CHOOSE SETTINGS</h1>
	<div class="flex flex-col justify-center items-center gap-3 lg:gap-6 w-3/4 h-full text-red-200">
		 <label class="text-xs sm:text-sm">NEEDED POINTS TO WIN</label>
        <div class="flex justify-center items-center gap-2 w-full relative">
            <span class="absolute -top-[14px] sm:-top-4 text-red-700 text-xs sm:text-sm">{{ globalStore.winningScore }}pts</span>
            <span class="text-xs sm:text-sm"> 1 </span>
            <input v-model="globalStore.winningScore" id="small-range" type="range" min="1" max="50" class="slider w-full h-0.5 bg-neutral-50 rounded-lg appearance-none cursor-pointer range-sm">
            <span class="text-xs sm:text-sm"> 50 </span>
        </div>
        <label class="text-xs sm:text-sm">BALL SPEED</label>
        <div class="flex justify-center items-center gap-2 w-full relative">
            <span class="absolute -top-[14px] sm:-top-4 text-red-700 text-xs sm:text-sm">{{ globalStore.ballSpeed / 100 }}<span class="pl-1">x</span></span>
            <span class="text-xs sm:text-sm"> 1/2x </span>
            <input v-model="globalStore.ballSpeed" id="small-range" type="range" min="50" max="200" class="slider w-full h-0.5 bg-neutral-50 rounded-lg appearance-none cursor-pointer range-sm">
            <span class="text-xs sm:text-sm">2x</span>
        </div>
        <label class="text-xs sm:text-sm">RACKET SIZE</label>
        <div class="flex justify-center items-center gap-2 w-full relative">
            <span class="absolute -top-[14px] sm:-top-4 text-red-700 text-xs sm:text-sm">{{ globalStore.racketSize }}%</span>
            <span class="text-xs sm:text-sm"> 50% </span>
            <input v-model="globalStore.racketSize" id="small-range" type="range" min="50" max="150" class="slider w-full h-0.5 bg-neutral-50 rounded-lg appearance-none cursor-pointer range-sm">
            <span class="text-xs sm:text-sm"> 150% </span>
        </div>
		<label class="text-xs sm:text-sm sm:pt-6">INCREASE SPEED / TIME</label>
		<div class="flex gap-4">
			<span class="-rotate-90 -translate-y-0.5">🚀</span>
			<toogle :gameSetting="true" @switchButton="globalStore.increaseSpeed = !globalStore.increaseSpeed"></toogle>
			<span>🚀</span>
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

.smallSlider::-webkit-slider-thumb {
-webkit-appearance: none; /* Override default look */
  appearance: none;
  width: 12px; /* Set a specific slider handle width */
  height: 12px; /* Slider handle height */
  background: #F5F5F5; /* Green background */
  border-radius: 50%;
  border: solid;
  border-color: #2563EB;
  border-width: 1px;
  cursor: pointer; /* Cursor on hover */
}
</style>