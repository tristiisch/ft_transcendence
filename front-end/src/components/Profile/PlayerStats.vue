<script setup lang="ts">
import type User from '@/types/User';
const props = defineProps<{
  user: User
}>()
</script>

<template>
    <div class="flex justify-around items-center h-full w-full border-b-[1px] border-red-400">
		<img src="@/assets/trophy.png" class="h-10 sm:h-16 md:h-20" />
        <div>
            <h2 class="text-red-900 text-base sm:text-lg md:text-xl">WIN:</h2>
            <h1 class="text-lime-400 text-2xl sm:text-4xl md:text-6xl">{{ user.nbVictory }}</h1>
        </div>
        <div>
            <h2 class="text-red-900 text-base sm:text-lg md:text-xl">LOSSES:</h2>
            <h1 class="text-red-700 text-2xl sm:text-4xl md:text-6xl">{{ user.nbDefeat }}</h1>
        </div>
    </div>  
</template>