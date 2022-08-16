<script setup lang="ts">
import { computed } from 'vue';
import Status from '@/types/Status';
import type User from '@/types/User';
const props = defineProps<{
  user: User
}>()

const isInGame = computed(() => {
    return props.user.current_status === Status.INGAME ? true : false;
})

const isOnline = computed(() => {
    return props.user.current_status === Status.ONLINE ? true : false;
})

</script>

<template>
    <div class="flex justify-center items-center gap-2">
        <img v-if="isInGame" src="@/assets/inGame.png" class="h-4 sm:h-8 sm:pr-2" />
        <span v-else-if="isOnline" class="w-2 h-2 rounded-full bg-green-400 sm:h-3 sm:w-3"></span>
        <span v-else class="w-2 h-2 rounded-full bg-red-600 sm:h-3 sm:w-3"></span>
    </div>
</template>