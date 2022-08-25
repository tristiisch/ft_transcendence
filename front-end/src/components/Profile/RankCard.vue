<script setup lang="ts">
const props = defineProps<{
  rank?: number
}>()
</script>

<template>
    <div class="self-start h-18 w-12 rounded-b-lg bg-black sm:rounded-none sm:rounded-r-lg -mt-4 sm:mt-0 sm:w-20 sm:h-12">
        <div class="flex flex-col items-center h-full sm:flex-row">
            <img src="@/assets/rank_logo.png" class="h-8 w-8 mt-1 sm:mt-0 sm:ml-1 sm:h-12 sm:w-12" />
            <base-button link to="/leaderboard">
                <p class="text-white text-lg sm:text-2xl">{{ rank }}</p>
            </base-button>
        </div>
    </div>
</template>
