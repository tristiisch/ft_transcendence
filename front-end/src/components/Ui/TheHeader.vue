<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { useGlobalStore } from '@/stores/globalStore';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const globalStore = useGlobalStore();
const userStore = useUserStore();
const route = useRoute();

const isProfilePage = computed(() => {
	return parseInt(route.params.id as string) === userStore.userData.id;
});
</script>

<template>
	<div class="relative flex items-center h-[10%] min-h-[100px] sm:min-h-[140px] sm:pt-8" :class="{ 'justify-end': isProfilePage, 'justify-between': !isProfilePage }">
		<div v-show="!isProfilePage" class="flex gap-1">
			<base-button link :to="{ name: 'Profile', params: { id: userStore.userData.id } }">
				<img class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 object-cover border-neutral-100 hover:border-[#f1cf3b]" :src="userStore.userData.avatar" alt="Rounded avatar" />
			</base-button>
			<div v-if="globalStore.notifications.length" class="flex flex-col items-center self-end h-full gap-1">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f1cf3b" class="w-6 h-6">
					<path fill-rule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clip-rule="evenodd" />
				</svg>
				<div class="flex w-4 h-4 justify-center items-center border border-lime-400 rounded-full text-xs text-lime-400">4</div>
			</div>
		</div>
		<div>
			<base-button
				class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-1 focus:outline-none focus:ring-red-300 shadow-lg shadow-red-500/50 font-medium rounded-lg text-xs sm:text-sm px-3 py-2 sm:px-5 sm:py-2.5 text-center"
				@click="userStore.handleLogout"
			>
				Logout
			</base-button>
		</div>
	</div>
</template>
