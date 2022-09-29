<script setup lang="ts">
import { onBeforeMount, ref} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ButtonPlus from '@/components/Button/ButtonPlus.vue';
import ButtonReturnNext from '@/components/Button/ButtonReturnNext.vue';
import { useGlobalStore } from '@/stores/globalStore';
import { useChatStore } from '@/stores/chatStore';
import UserService from '@/services/UserService';
import { useUserStore } from '@/stores/userStore';

const globalStore = useGlobalStore();
const userStore = useUserStore();
const chatStore = useChatStore();
const mode = ref('random')
const router = useRouter();
const route = useRoute();

function changeMode(type: string) {
    if (!globalStore.invitedUser) {
        if (mode.value === 'random' && type !== 'random')
            mode.value = 'invite';
        else if (mode.value === 'invite' && type !== 'invite')
            mode.value = 'random';
    }
}

const emit = defineEmits<{
	(e: 'invitePlayer'): void,
    (e: 'return'): void,
}>()

function launchGame() {
	if (mode.value === 'random')
		router.push({ name: 'MatchMaking', query: { custom: 'true' }});
}

function closeInvitation() {
	UserService.removeInvitation()
		.then(() => {
			if (globalStore.invitedUser) {
				chatStore.removeSpinner(userStore.userData.id, globalStore.invitedUser.id)
				globalStore.invitedUser = undefined;
			}
		})
		.catch((error) => {
			router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
		})
}

function updateBackground() {
	if (globalStore.gameInvitation) return 'bg-yellow-400 border-yellow-400'
	else if (globalStore.invitedUser) return 'bg-red-700 border-yellow-700'
	else return 'bg-neutral-100 border-blue-600'
}

onBeforeMount(() => {
	if (globalStore.invitedUser)
		mode.value = 'invite';
});

</script>

<template>
    <div class="flex flex-col items-center w-full h-full">
        <h1 class="flex justify-center items-center w-3/4 h-[40px] sm:h-[50px] text-sm sm:text-base text-red-200 border-b border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500 shrink-0">PLAYERS</h1>
		<div class="inline-flex justify-center w-full pt-4 sm:pt-12">
			<button @click="changeMode('random')" class="w-[38%] py-1.5 sm:py-2.5 px-4 text-xs sm:text-sm border-blue-600 rounded-l-md border" :class="mode === 'random' && !globalStore.invitedUser ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-blue-600'">Random</button>
			<button @click="changeMode('invite')" class="w-[38%] py-1.5 sm:py-2.5 px-4 text-xs sm:text-sm border-blue-600 rounded-r-md border-t border-b" :class="mode === 'invite' || globalStore.invitedUser ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-blue-600'">Invite</button>
		</div>
		<div v-if="mode === 'invite' || globalStore.invitedUser" class="h-full flex flex-col justify-center items-center w-full pt-2 gap-4">
			<div :class="updateBackground()" class="flex justify-center items-center border text-blue-600 rounded-full min-w-[120px] min-h-[120px] sm:min-w-[150px] sm:min-h-[150px] w-[calc(0.18_*_100vh)] h-[calc(0.18_*_100vh)] w-[calc(0.2_*_100vh)] h-[calc(0.2_*_100vh)]">
				<img v-if="globalStore.invitedUser" class="flex justify-center items-center min-w-[110px] min-h-[110px] sm:min-w-[140px] sm:min-h-[140px] w-[calc(0.165_*_100vh)] h-[calc(0.165_*_100vh)] w-[calc(0.185_*_100vh)] h-[calc(0.185_*_100vh)] rounded-full object-cover" :src=globalStore.invitedUser.avatar>
				<div v-else class="flex items-center gap-2">
					<button-plus @click="emit('invitePlayer')"></button-plus>
					<label class="text-xs sm:text-sm text-blue-600">Choose Player</label>
				</div>
			</div>
			<div v-if="globalStore.invitedUser" class="flex justify-center items-center w-full text-red-100 text-xs sm:text-sm">
				<p v-if="globalStore.gameInvitation" class="px-2"> READY TO GO!<span class="pl-3">🚀</span></p>
				<div v-else class="flex justify-center items-center">
					<svg class="w-6 h-6 text-neutral-300 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
						<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
					</svg>
					<p class="px-2 text-red-200">Invitation of <span class="text-red-700">{{ globalStore.invitedUser.username }}</span> pending...</p>
				</div>
			</div>
		</div>
		<div v-else class="h-full flex justify-center items-center w-full pt-2">
			<button @click="launchGame" class="flex flex-col justify-center items-center bg-neutral-100 pl-1 border border-blue-600 text-blue-600 hover:text-red-700 hover:bg-yellow-400 hover:border-red-700 rounded-full tracking-[0.3em] sm:tracking-[0.6em] min-w-[120px] min-h-[120px] sm:min-w-[150px] sm:min-h-[150px] w-[calc(0.18_*_100vh)] h-[calc(0.18_*_100vh)] w-[calc(0.2_*_100vh)] h-[calc(0.2_*_100vh)]">
				<img src="@/assets/rocket.png" class="min-w-[80px] min-h-[80px] sm:min-w-[115px] sm:min-h-[115px] w-[calc(0.1_*_100vh)] h-[calc(0.12_*_100vh)] sm:w-[calc(0.14_*_100vh)] sm:h-[calc(0.16_*_100vh)]">
				<label class="pl-1 pb-6 [font-size:_calc(0.012_*_100vh)]">LAUNCH</label>
			</button>	
		</div>
    </div>
	<button v-if="globalStore.invitedUser" @click="closeInvitation()" class="bg-red-600 text-red-200 border border-red-700 hover:text-white rounded-lg mt-4 focus:ring-2 focus:ring-gray-300 p-1 sm:p-2 mb-1 self-end inline-flex h-6 w-6 sm:h-8 sm:w-8">
		<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
	</button>
	<button-return-next v-else @click="emit('return')" side="previous" class="mb-1 self-end"></button-return-next>
</template>
