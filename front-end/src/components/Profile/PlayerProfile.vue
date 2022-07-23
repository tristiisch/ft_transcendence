<script setup lang="ts">
import Status from '@/types/Status';
import type User from '@/types/User';
const props = defineProps<{
  user: User
}>()

function isOnline() {
	return props.user.current_status === Status.ONLINE ? true : false;
}

function isInGame() {
	return props.user.current_status === Status.INGAME ? true : false;
}
</script>

<template>
    <div class="flex flex-col justify-around items-center gap-2 pl-3 sm:pl-0 sm:max-w-full ">
        <img class="w-20 h-20 rounded-full object-cover border-2 sm:w-28 sm:h-28 md:w-36 md:h-36" :src="user.avatar" alt="Rounded avatar" />
        <div class="flex justify-center items-center gap-2">
            <img v-if="isInGame()" src="../assets/inGame.png" class="h-6 sm:h-10 pr-2" />
            <span v-else-if="isOnline()" class="w-2 h-2 rounded-full bg-green-400 sm:h-3 sm:w-3 md:h-4 md:w-4"></span>
            <span v-else class="w-2 h-2 rounded-full bg-red-600 sm:h-3 sm:w-3 md:h-4 md:w-4"></span>
            <span class="text-xl md:text-3xl">{{ user.username }}</span>
        </div>
    </div>
</template>