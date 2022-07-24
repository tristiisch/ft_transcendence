<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthService from '@/services/AuthService';
import BaseCard from '../components/BaseCard.vue';
import ButtonGradient1 from '@/components/ButtonGradient1.vue';

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
	router.push('/home');
}

onMounted(() => {
	console.log('onMounted');
	if (route.query.code !== undefined) handleLogin();
});
</script>

<template>
	<div class="background" />

	<div class="flex flex-col items-center justify-center h-full pb-32">
		<div class="flex justify-center font-Arlon text-white text-6xl m-4">TV PONG<span class="text-white">™</span></div>
		<button-gradient1 v-if="!authStore.getIsAuthenticated" @click="redirectTo42LoginPage()"><span>Login with 42</span></button-gradient1>
		<BaseCard v-else>
			<div class="flex gap-4 ">
				<div class="flex flex-col gap-4 ">
					<p class="text-gray-500 bg-slate-800 w-full">Please choose an username and avatar</p>
					<input
						class="placeholder-gray-500 text-center font-medium rounded-lg text-xs px-3 py-2 sm:px-5 md:text-sm md:px-8 sm:py-2.5"
						type="text"
						name="username"
						v-model.trim="username"
						placeholder="Username"
					/>
					<button-gradient1 @click="redirectToHome"><span>Send</span></button-gradient1>
				</div>
				<img class="w-20 h-20 rounded-full object-cover border-2 sm:w-28 sm:h-28 md:w-36 md:h-36" src="@/assets/obama.jpeg" alt="Rounded avatar" />
			</div>
		</BaseCard>
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
