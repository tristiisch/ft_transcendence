<script setup lang="ts">
import type User from '@/types/User';
const props = defineProps<{
  user: User
}>()
</script>

<template>
    <div class="flex justify-around items-center w-full border-b-[1px] pb-4 border-red-400">
		<img src="@/assets/trophy.png" class="h-10 sm:h-16 3xl:h-20" />
        <div class="flex flex-col items-center">
            <h2 class="text-red-800 text-base sm:text-lg 3xl:text-xl">WIN:</h2>
            <h1 class="text-lime-400 text-2xl sm:text-4xl 3xl:text-6xl">{{ user.nbVictory }}</h1>
        </div>
        <div class="flex flex-col items-center">
            <h2 class="text-red-800 text-base sm:text-lg 3xl:text-xl">LOSSES:</h2>
            <h1 class="text-red-700 text-2xl sm:text-4xl 3xl:text-6xl">{{ user.nbDefeat }}</h1>
        </div>
    </div>  
</template>