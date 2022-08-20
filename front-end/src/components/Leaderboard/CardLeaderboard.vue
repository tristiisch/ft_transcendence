<script setup lang="ts">
    import type User from '@/types/User';
    import Status from '@/types/Status';
    import PlayerStatus from '@/components/PlayerStatus.vue'
    import { computed, ref, onMounted, onUnmounted, onBeforeUpdate } from 'vue';

    const sizeAvatar = ref<HTMLInputElement | null>(null)
    const avatarWidth = ref(sizeAvatar.value?.width.toString() as string)
    const windowHeight = ref(window.innerHeight);
    const props = defineProps<{ user: User }>()
    
    const userStatus = computed(() => {
        if (props.user.status === Status.INGAME)
            return 'Ingame'
        else if (props.user.status === Status.OFFLINE)
            return 'Offline'
        else (props.user.status === Status.ONLINE)
            return 'Online'
    })

    function handleResize() {
        if (sizeAvatar.value)
        {
            let size = (sizeAvatar.value?.width + 20).toString()
            avatarWidth.value = 'padding-left: '+ size + 'px'
        }
    }

    onMounted(() => {
        window.addEventListener('resize', handleResize)
        windowHeight.value +=1
        handleResize()
        windowHeight.value -=1
    });

    onUnmounted(() => {
        window.removeEventListener('resize', handleResize)
    })
</script>

<template>
    <div
        class="relative grid [grid-template-columns:_2fr_1fr_1fr] auto-cols-min place-content-center h-full text-slate-800 overflow-hidden bg-gradient-to-r from-red-400 to-blue-500 hover:from-green-500 hover:to-lime-200"
    >
        <img ref="sizeAvatar" class="absolute left-[2%] top-[30%] rounded-full h-[40%] sm:left-0 sm:-top-[15%] sm:h-[150%] aspect-square sm:rounded-none sm:rounded-r-full object-cover" :src="user.avatar" alt="Rounded avatar" />
        <div class="flex items-center pr-4" :style="avatarWidth">
            <base-button link :to="{ name: 'Profile', params: { username: user.username } }">{{ user.username }}</base-button>
        </div>
        <div class="flex gap-3">
            <player-status :user="user"></player-status>
            <span>{{ userStatus }}</span>
        </div>
        <div class="flex justify-center items-center">{{ user.rank }}</div>
    </div>
</template>
