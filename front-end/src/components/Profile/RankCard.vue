<script setup lang="ts">
const props = defineProps<{
  rank: number
}>()
</script>

<template>
    <div class="flex flex-col items-center self-start h-16 w-12 rounded-b-lg bg-black sm:rounded-r-lg sm:flex-row sm:w-20 sm:h-12 md:h-16 md:w-28">
        <img src="@/assets/rank_logo.png" class="h-10 w-10 mt-1 sm:mt-0 sm:ml-2 sm:h-12 sm:w-12 md:h-14 md:w-14" />
        <base-button link to="/leaderboard">
            <p class="text-white text-lg md:text-3xl">{{ rank }}</p>
        </base-button>
    </div>
</template>
