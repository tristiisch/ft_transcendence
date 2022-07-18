<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'
const userStore = useUserStore()
defineProps<{
  isProfilePage?: boolean
}>()
</script>

<template>
    <div  class="flex items-center py-6" :class="{'justify-end': isProfilePage, 'justify-between': !isProfilePage}">
        <div v-show="!isProfilePage">
            <base-button link :to="`/profile/${userStore.getId}`">
                <img class="w-16 h-16 md:w-20 md:h-20 xl:w-28 xl:h-28 rounded-full border-2 object-cover hover:border-[#f1cf3b]" src="@/assets/obama.jpeg" alt="Rounded avatar">
            </base-button>
        </div>
        <div>
            <base-button  class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 shadow-lg shadow-red-500/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"> Logout </base-button>
        </div>
    </div>
</template> 