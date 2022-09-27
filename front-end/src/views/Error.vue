<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import ButtonGradient from '@/components/Button/ButtonGradient.vue';

const route = useRoute();
const userStore = useUserStore();

const error = computed(() => {
	if (route.query.code)
	{
		if (route.query.code === '0')
			return 'Network Error'
		else
			return 'Error ' + route.query.code
	}
	else return 'Page not Found'
})
const errorMessage = computed(() => {
	if (route.query.code)
	{
		if (route.query.code === '0')
			return 'Unable to connect to server'
		else
			return route.query.message
	}
	else return ''
})
</script>

<template>
	<div class="flex flex-col items-center justify-center text-center pb-32 h-full w-full gap-6">
		<div>
			<h1 class="font-Arlon text-white text-5xl sm:text-6xl">{{ error }}</h1>
			<p class="font-Arlon text-white text-5xl sm:text-4xl">{{ errorMessage }}</p>
		</div>
		<div class="flex gap-3">
			<button-gradient link v-if="userStore.userData.id" :to="{ name: 'Home' }">Home</button-gradient>
			<base-button
					class="w-[80px] sm:w-[130px] text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-1 focus:outline-none focus:ring-red-300 shadow-lg shadow-red-500/50 font-medium rounded-lg text-xs sm:text-sm px-3 py-2 sm:px-5 sm:py-2.5 text-center"
			@click="userStore.handleLogout">Logout</base-button>
		</div>
	</div>
	<div class="h-full w-full fixed bg-brick bg-bottom bg-cover top-0 left-0 -z-20 [transform:_scale(1.2)]"></div>
</template>
