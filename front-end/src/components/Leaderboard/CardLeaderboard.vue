<script setup lang="ts">
   import type User from '@/types/User';
   import Status from '@/types/Status';
   import PlayerStatus from '@/components/PlayerStatus.vue'
   import { computed, ref, onUpdated} from 'vue';

    const sizeAvatar = ref<HTMLInputElement | null>(null)
    const props = defineProps<{
    user: User
}>()

const userStatus = computed(() => {
    if (props.user.status === Status.INGAME)
        return 'Ingame'
    else if (props.user.status === Status.OFFLINE)
        return 'Offline'
    else (props.user.status === Status.ONLINE)
        return 'Online'
})

</script>

<template>
    <div
        class="relative grid grid-flow-col auto-cols-fr place-content-center h-full myshadow2 overflow-hidden bg-gradient-to-r from-red-400 to-blue-500 hover:from-green-500 hover:to-lime-200"
    >
        <img class="absolute left-[2%] top-[30%] rounded-full h-[40%] sm:left-0 sm:-top-[15%] sm:h-[150%] aspect-square sm:rounded-none sm:rounded-r-full object-cover" ref="sizeAvatar" :src="user.avatar" alt="Rounded avatar" />
        <div class="flex items-center pl-[50px] sm:pl-[130px] 3xl:pl-[calc(0.14_*_100vh)]">
            <base-button link :to="{ name: 'Profile', params: { username: user.username } }">{{ user.username }}</base-button>
        </div>
        <div class="flex flex-col justify-center gap-3 items-center sm:flex-row">
            <player-status :user="user"></player-status>
            <span>{{ userStatus }}</span>
        </div>
        <div class="flex justify-center items-center">{{ user.rank }}</div>
    </div>
</template>
