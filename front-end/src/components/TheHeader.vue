<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'
const userStore = useUserStore()
defineProps<{
  isProfilePage?: boolean
  isHomePage?: boolean
}>()
</script>

<template>
    <div  class="relative flex items-center h-[10%] min-h-[120px] sm:pt-8" :class="{'justify-end': isProfilePage, 'justify-between': !isProfilePage}">
        <div v-show="!isProfilePage">
            <base-button link :to="`/profile/${userStore.getId}`">
                <img class="w-16 h-16 md:w-20 md:h-20 xl:w-28 xl:h-28 rounded-full border-2 object-cover hover:border-[#f1cf3b]" src="@/assets/obama.jpeg" alt="Rounded avatar">
            </base-button>
        </div>
        <div v-show="isHomePage" class="absolute m-auto left-0 right-0 -bottom-10 text-center text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
            <span class="px-[2vw]">W</span>
            <span class="px-[2vw]">E</span>
            <span class="px-[2vw]">L</span>
            <span class="px-[2vw]">C</span>
            <span class="px-[2vw]">O</span>
            <span class="px-[2vw]">M</span>
            <span class="px-[2vw]">E</span>
        </div>
        <div>
            <base-button  class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 shadow-lg shadow-red-500/50 font-medium rounded-lg text-xs sm:text-sm px-3 py-2 sm:px-5 sm:py-2.5 text-center mr-2 mb-2"> Logout </base-button>
        </div>
    </div>
</template> 