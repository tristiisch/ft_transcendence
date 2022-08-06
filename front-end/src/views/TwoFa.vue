<script setup lang="ts">
import BaseCard from '../components/BaseCard.vue';
import ButtonGradient1 from '@/components/ButtonGradient1.vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { ref } from 'vue';

const router = useRouter();
const userStore = useUserStore();
const toast = useToast();

const TwoFACode = ref('')

function onSubmit() {
	userStore
		.handleTwoFaAuthentification(TwoFACode.value)
		.then(() => {
			router.replace({ name: 'Home' });
		})
		.catch((e) => {
			toast.error(e.response.data.message);
		});
}
</script>

<template>
	<div class="background" />
	<div class="flex flex-col items-center justify-center h-full pb-32">
		<div class="flex justify-center font-Arlon text-white text-6xl m-4">TV PONG<span class="text-white">™</span></div>
		<BaseCard>
			<h1 class="flex justify-center text-yellow-300">⚠️ Two Factor Authentification enabled</h1>
			<p class="flex justify-center text-gray-500">Please enter your 2FA code below :</p>
			<form class="flex justify-center gap-4" @submit.prevent>
				<input type="password" name="TwoFACode" v-model="TwoFACode" placeholder="Enter 2FA code here" />
				<button-gradient1 @click="onSubmit">Send</button-gradient1>
			</form>
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
