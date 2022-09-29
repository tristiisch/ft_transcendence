<script setup lang="ts">
import { computed } from 'vue';
import Status from '@/types/Status';

const props = defineProps<{ userStatus?: Status }>()

const isInGame = computed(() => {
    return props.userStatus === Status.INGAME ? true : false;
})

const isOnline = computed(() => {
    return props.userStatus === Status.ONLINE ? true : false;
})

const isSpectator= computed(() => {
    return props.userStatus === Status.SPEC ? true : false;
})

</script>

<template>
    <div class="flex justify-center items-center gap-2">
        <img v-if="isInGame" src="@/assets/inGame.png" class="h-4 sm:h-8 sm:pr-2" />
        <span v-else-if="isOnline" class="w-2 h-2 rounded-full bg-green-400 sm:h-3 sm:w-3"></span>
		<img v-if="isSpectator" src="@/assets/Spectator.png" class="h-4 sm:h-8 sm:pr-2" />
        <span v-else class="w-2 h-2 rounded-full bg-red-600 sm:h-3 sm:w-3"></span>
    </div>
</template>
