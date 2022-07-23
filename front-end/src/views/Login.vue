<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthService from '@/services/AuthService';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const username = '';

const code = route.query.code as string;
const state = route.query.state as string;

async function handleLogin() {
	await AuthService.login(code, state)
		.then((response) => {
			console.log(response);
			authStore.isAuthenticated = true;
			console.log(authStore.getIsAuthenticated);
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

function redirectTo42LoginPage(): void {
	window.location.href = import.meta.env.VITE_REDIRECT_42;
}

function redirectToHome(): void {
	router.push('/home')
}

onMounted(() => {
	console.log('onMounted');
	if (route.query.code !== undefined) handleLogin();
});
</script>

<template>
	<div class="background" />
	<div class="flex items-center justify-center h-screen" >
		<base-button
			v-if="!authStore.getIsAuthenticated"
			class="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-xs px-3 py-2 sm:px-5 md:text-sm md:px-8 sm:py-2.5 text-center"
		 @click="redirectTo42LoginPage()">
			Login with 42</base-button
		>
		<div v-else>
			<input type="text" name="username" v-model.trim="username" placeholder="Username" />
			<base-button
			class="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-xs px-3 py-2 sm:px-5 md:text-sm md:px-8 sm:py-2.5 text-center"
		 @click="redirectToHome()">
			Send</base-button
		>
		</div>
	</div>
</template>

<style scoped>
.background {
	top: 0;
	left: 0;
	position: fixed;
	margin: 0;
	background-image: url(@/assets/brick.jpg);
	background-size: cover;
	background-repeat: no-repeat;
	background-position: bottom;
	background-attachment: fixed;
	height: 100%;
	width: 100%;
	transform: scale(1.2);
	/*background: radial-gradient(ellipse farthest-corner at center top, #f39264 0%, #f2606f 100%);*/
	z-index: -100;
}
</style>
