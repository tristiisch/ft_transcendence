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
	<div class="flex flex-col items-center justify-center text-center pb-32 h-full w-full">
		<h1 class="font-Arlon text-white text-5xl sm:text-6xl m-2">{{ error }}</h1>
		<h5 class="font-Arlon text-white text-5xl sm:text-4xl m-4">{{ errorMessage }}</h5>
		<div class="flex gap-3">
			<button-gradient link :to="{ name: 'Home' }">Home</button-gradient>
			<base-button
					class="w-[80px] sm:w-[130px] text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-1 focus:outline-none focus:ring-red-300 shadow-lg shadow-red-500/50 font-medium rounded-lg text-xs sm:text-sm px-3 py-2 sm:px-5 sm:py-2.5 text-center"
			@click="userStore.handleLogout">Logout</base-button>
		</div>
	</div>
</template>
