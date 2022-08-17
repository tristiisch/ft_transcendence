<script setup lang="ts">
import BaseCard from '../components/BaseCard.vue';
import ButtonGradient1 from '@/components/ButtonGradient1.vue';
import UploadAvatar from '@/components/UploadAvatar.vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useToast } from 'vue-toastification';
import { ref, watch, onBeforeMount } from 'vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const toast = useToast();

const username = ref(userStore.userData.username);
const image = ref(userStore.userData.avatar);
let isUpload = false;
const TwoFACode = ref('');
const isLoading = ref(false);

function redirectTo42LoginPage(): void {
	const baseUrl = import.meta.env.VITE_42_API_URL;

	const options = {
		client_id: import.meta.env.VITE_CLIENT_ID,
		redirect_uri: import.meta.env.VITE_OAUTH_REDIRECT,
		scope: 'public',
		state: import.meta.env.VITE_CLIENT_STATE,
		response_type: 'code',
	};

	const queryString = new URLSearchParams(options).toString();
	window.location.href = `${baseUrl}?${queryString}`;
}

function uploadImage(imageData: string): void {
	image.value = imageData;
	isUpload = true;
}

watch(
	() => userStore.userData.username,
	() => {
		username.value = userStore.userData.username;
	}
);

watch(
	() => userStore.userData.avatar,
	() => {
		image.value = userStore.userData.avatar;
	}
);

function submit2faForm() {
	userStore
		.handle2Fa(TwoFACode.value)
		.then(() => {
			userStore.authenticateUser();
			router.replace({ name: 'Home' });
		})
		.catch((e) => {
			toast.error(e.response.data.message);
		});
}

function onlyLettersAndNumbers(str: string) {
	return /^[A-Za-z0-9]*$/.test(str);
}

function redirectToHome() {
	userStore.registerUser();
	router.replace({ name: 'Home' });
}

function submitRegistrationForm() {
	if (!username.value || !(username.value.length > 1 && username.value.length < 9)) toast.error('Username should have at least 2 and at most 9 characters.');
	else if (!onlyLettersAndNumbers(username.value)) toast.error('Username can only contain alphanumeric characters.');
	else {
		userStore
			.updateUsername(username.value)
			.then(() => {
				if (isUpload)
					userStore
						.updateAvatar(image.value)
						.then(() => {
							redirectToHome();
						})
						.catch((e) => {
							toast.error(e.response.data.message);
						});
				else redirectToHome();
			})
			.catch((e) => {
				toast.error(e.response.data.message);
			});
	}
}

onBeforeMount(() => {
	if (route.query.code !== undefined && route.query.state !== undefined && !userStore.isLoggedIn) {
		isLoading.value = true;
		userStore
			.handleLogin(route.query.code as string, route.query.state as string)
			.then(() => {
				console.log(userStore.userData['2fa']);
				if (userStore.isRegistered && !userStore.userData['2fa'])
					router.replace({ name: 'Home' });
				isLoading.value = false;
			})
			.catch((e) => {
				isLoading.value = false;
				toast.error(e.response.data.message);
			});
	}
});
</script>

<template>
	<div class="flex flex-col items-center justify-center h-full pb-32 mx-[8vw]">
		<div v-if="isLoading" class="flex items-center justify-center h-full font-Arlon text-white text-6xl">Loading</div>
		<div v-else class="flex flex-col items-center">
			<div class="font-Arlon text-white text-5xl sm:text-6xl m-4">TV PONG<span class="text-white">™</span></div>
			<button-gradient1 v-if="!userStore.isLoggedIn" @click="redirectTo42LoginPage()">Login with 42</button-gradient1>
			<BaseCard v-else-if="!userStore.isRegistered">
				<form class="flex justify-center items-center gap-4 sm:gap-8 w-full" @submit.prevent>
					<div class="flex flex-col gap-4 items-center">
						<p class="text-slate-500 text-center w-full">Please choose an username and avatar</p>
						<input
							class="placeholder-slate-600 w-full rounded bg-slate-800 text-center text-white font-medium text-xs px-3 py-2 sm:px-5 sm:py-2.5"
							type="text"
							name="username"
							v-model.trim="username"
							placeholder="Username"
						/>
						<button-gradient1 @click="submitRegistrationForm">Send</button-gradient1>
					</div>
					<upload-avatar login @image-loaded="uploadImage" :image="image"></upload-avatar>
				</form>
			</BaseCard>
			<BaseCard v-else-if="userStore.userData['2fa']">
				<form class="flex flex-col justify-center items-center gap-4">
					<h1 class="text-lime-400">⚠️ Two Factor Authentification enabled</h1>
					<p class="text-slate-500">Please enter your 2FA code below</p>
					<div class="flex justify-center gap-4" @submit.prevent>
						<input type="password" name="TwoFACode" v-model="TwoFACode" placeholder="2FA code" class="bg-slate-800 rounded placeholder:text-center placeholder:text-slate-600 text-white" />
						<button-gradient1 @click="submit2faForm">Send</button-gradient1>
					</div>
				</form>
			</BaseCard>
		</div>
	</div>
	<div class="h-full w-full fixed bg-brick bg-fixed bg-bottom bg-cover top-0 left-0 -z-10 [transform:_scale(1.2)]"></div>
</template>
