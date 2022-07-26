<script setup lang="ts">
import Status from '@/types/Status';
import type User from '@/types/User';
import PlayerStatus from '@/components/PlayerStatus.vue'
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
    <div class="self-center flex flex-col justify-around items-center gap-2 pt-4 pl-3 sm:pl-0 sm:max-w-full ">
        <img class="w-20 h-20 rounded-full object-cover border-2 sm:w-28 sm:h-28 md:w-36 md:h-36" :src="user.avatar" alt="Rounded avatar" />
        <div class="flex gap-2 sm:gap-5">
            <player-status :user="user"></player-status>
            <span class="text-xl md:text-3xl">{{ user.username }}</span>
        </div>
    </div>
</template>