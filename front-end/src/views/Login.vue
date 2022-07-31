<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import UsersService from '@/services/UserService';
import BaseCard from '../components/BaseCard.vue';
import ButtonGradient1 from '@/components/ButtonGradient1.vue';
import UploadAvatar from '@/components/Login/UploadAvatar.vue';

const userStore = useUserStore();
const router = useRouter();

function redirectTo42LoginPage(): void {
	window.location.href = import.meta.env.VITE_REDIRECT_42;
}

function submitForm(): void {
	UsersService.setUsername(userStore.userAuth.id, userStore.userData.username);
	userStore.userAuth.isRegistered = true
	localStorage.setItem('userAuth', JSON.stringify(userStore.userAuth));
	router.replace({ name: 'Home' });
}

function handleAvatarUpload(value: string): void {
	userStore.userData.avatar = value;
	UsersService.setAvatar(userStore.userAuth.id, userStore.userData.avatar);
	localStorage.setItem('userData', JSON.stringify(userStore.userData));
}

</script>

<template>
	<div class="background" />
	<div v-if="userStore.isLoading" class="flex items-center justify-center h-full font-Arlon text-white text-6xl">Loading</div>
	<div v-else class="flex flex-col items-center justify-center h-full pb-32">
		<div class="flex justify-center font-Arlon text-white text-6xl m-4">TV PONG<span class="text-white">™</span></div>
		<button-gradient1 v-if="!userStore.isLoggedIn" @click="redirectTo42LoginPage()"><span>Login with 42</span></button-gradient1>
		<BaseCard v-else>
			<form class="flex gap-4" @submit.prevent>
				<div class="flex flex-col gap-4">
					<p class="text-gray-500 bg-slate-800 w-full">Please choose an username and avatar</p>
					<input
						class="placeholder-gray-500 text-center font-medium rounded-lg text-xs px-3 py-2 sm:px-5 md:text-sm md:px-8 sm:py-2.5"
						type="text"
						name="username"
						v-model.trim="userStore.userData.username"
						placeholder="Username"
					/>
					<button-gradient1 @click="submitForm"><span>Send</span></button-gradient1>
				</div>
				<upload-avatar @image-loaded="handleAvatarUpload" :image="userStore.userData.avatar"></upload-avatar>
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
