<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { useGlobalStore } from '@/stores/globalStore';
import { useRoute } from 'vue-router';
import { computed, ref, onBeforeMount } from 'vue';

const globalStore = useGlobalStore();
const userStore = useUserStore();
const route = useRoute();
const userId = ref();
const routeId = ref();

const isProfilePage = computed(() => {
	return routeId.value === userId.value;
});

onBeforeMount(() => {
	userId.value = userStore.userData.id
	routeId.value = parseInt(route.params.id as string);
});
</script>

<template>
	<div class="relative flex items-center h-[10%] min-h-[100px] sm:min-h-[140px] sm:pt-8" :class="{ 'justify-end': isProfilePage, 'justify-between': !isProfilePage }">
		<div v-show="!isProfilePage" class="flex gap-1 ml-[3vw]">
			<base-button link :to="{ name: 'Profile', params: { id: userId} }">
				<img class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 object-cover border-neutral-100 hover:border-[#f1cf3b]" :src="userStore.userData.avatar" alt="Rounded avatar" />
			</base-button>
			<base-button v-if="globalStore.notifications.length" class="absolute top-16 left-12 sm:top-[100px] sm:left-[60px] ml-[3vw]" link :to="{ name: 'Profile', params: { id: userId },  query: { notification: userId } }">
				<div  class="flex justify-center items-center bg-red-600 w-5 h-5 border border-red-300 rounded-full text-xs text-neutral-100 hover:border-[#f1cf3b]">{{ globalStore.notifications.length }}</div>
			</base-button>
		</div>
		<div class="mr-[3vw]">
			<base-button
				class="text-white bg-gradient-to-r font-Noir from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-1 focus:outline-none focus:ring-red-300 shadow-lg shadow-red-500/50 font-medium rounded-lg text-xs sm:text-sm px-3 py-2 sm:px-5 sm:py-2.5 text-center"
				@click="userStore.handleLogout()"
			>
				Logout
			</base-button>
		</div>
	</div>
</template>
