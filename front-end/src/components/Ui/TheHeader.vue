<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const userStore = useUserStore()
const route = useRoute();

const isProfilePage = computed(() => {
    console.log(route.name)
    return (parseInt(route.params.id as string) === userStore.userData.id)
})

</script>

<template>
    <div  class="relative flex items-center h-[10%] min-h-[100px] sm:min-h-[140px] sm:pt-8" :class="{'justify-end': isProfilePage, 'justify-between': !isProfilePage}">
        <div v-show="!isProfilePage">
            <base-button link :to="{ name: 'Profile', params: { id: userStore.userData.id }}">
                <img class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 object-cover border-neutral-100 hover:border-[#f1cf3b]" :src="userStore.userData.avatar" alt="Rounded avatar">
            </base-button>
        </div>
        <div>
            <base-button  class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-1 focus:outline-none focus:ring-red-300 shadow-lg shadow-red-500/50 font-medium rounded-lg text-xs sm:text-sm px-3 py-2 sm:px-5 sm:py-2.5 text-center" @click="userStore.handleLogout"> Logout </base-button>
        </div>
    </div>
</template>
