<script setup lang="ts">
import { onMounted, ref} from 'vue';
import type User from '@/types/User';
import ButtonPlus from '@/components/Button/ButtonPlus.vue';
import ButtonReturnNext from '@/components/Button/ButtonReturnNext.vue';

const mode = ref('random')

const props = defineProps<{
  invitation: boolean;
  invitedUser: User | undefined
}>()

function changeMode() {
    if (!props.invitation) {
        if (mode.value === 'random')
            mode.value = 'invite';
        else
            mode.value = 'random';
    }
}
const emit = defineEmits<{
	(e: 'invitePlayer'): void,
    (e: 'return'): void,
}>()

</script>

<template>
    <div class="flex flex-col items-center w-full h-full">
        <h1 class="flex justify-center items-center w-3/4 h-[40px] sm:h-[50px] text-sm sm:text-base text-red-200 border-b border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500 shrink-0">PLAYERS</h1>
        <div class="inline-flex justify-center w-full pt-4 sm:pt-6">
            <button @click="changeMode()" class="btn-base rounded-l-md border" :class="mode === 'random' && !invitation ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-blue-600'">Random</button>
            <button @click="changeMode()" class="btn-base rounded-r-md border-t border-b" :class="mode === 'invite' || invitation ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-blue-600'">Invite</button>
        </div>
        <div v-if="mode === 'invite' || invitation === true" class="flex flex-col justify-center items-center py-2 sm:py-4 w-3/4 bg-neutral-100 border border-blue-600 rounded-lg mt-2 3xl:mt-6 h-1/2">
            <div v-if="!invitation" class="flex items-center gap-2">
                <button-plus @click="emit('invitePlayer')"></button-plus>
                <label class="text-xs sm:text-sm text-blue-600">Choose Player</label>
            </div>
            <div v-else class="flex items-center justify-evenly w-full text-blue-600 text-xs sm:text-sm">
                    <div>
                        <p class="px-2">Invitation of <span class="text-red-600">{{ invitedUser?.username }}</span> pending...</p>
                    </div>
                    <div role="status">
                        <svg class="inline mr-2 w-6 h-6 text-neutral-300 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                        </svg>
                        <span class="sr-only">Loading...</span>
                    </div>
            </div>
        </div>
    </div>
    <div class="flex w-full pl-8">
        <div class="flex flex-col items-center w-full">
            <img src="@/assets/rocket.png" class="-mb-[calc(0.01_*_100vh)] sm:-mb-[calc(0.014_*_100vh)] h-[calc(0.14_*_100vh)] w-[calc(0.12_*_100vh)] min-h-[100px] min-w-[100px] sm:h-[calc(0.12_*_100vh)] sm:w-[calc(0.14_*_100vh)] sm:min-h-[140px] sm:min-w-[140px]">
            <div class="flex w-[95%] justify-center items-center">
                <button class="bg-neutral-100 py-1 sm:py-2 w-full border border-blue-600 text-blue-600 hover:text-neutral-100 hover:bg-blue-600 rounded-md tracking-[0.5em]">LAUNCH</button>
            </div>
        </div>
        <button-return-next  @click="emit('return')" side="previous" class="self-end mb-1"></button-return-next>
    </div>
</template>
    

<style scoped>
.btn-base {
	@apply w-[38%] py-1.5 sm:py-2.5 px-4 text-xs sm:text-sm border-blue-600;
}
</style>