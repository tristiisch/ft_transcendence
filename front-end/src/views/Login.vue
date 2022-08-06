<script setup lang="ts">
import BaseCard from '../components/BaseCard.vue';
import ButtonGradient1 from '@/components/ButtonGradient1.vue';
import UploadAvatar from '@/components/Login/UploadAvatar.vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useToast } from 'vue-toastification';
import { ref, watch } from 'vue';
import socket from '@/socket';

const router = useRouter();
const userStore = useUserStore();
const toast = useToast();

const username = ref(userStore.userData.username);
const image = ref(userStore.userData.avatar);
let isUpload = false;

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

function onlyLettersAndNumbers(str: string) {
	return /^[A-Za-z0-9]*$/.test(str);
}

function submitForm() {
	if (!username.value || (username.value.length < 2 && username.value.length > 9)) toast.error('Please enter a username between 2 and 9 characters long.');
	else if (!onlyLettersAndNumbers(username.value)) toast.error('Username can only contain alphanumeric characters.');
	else {
		userStore
			.updateUsername(username.value)
			.then(() => {
				if (isUpload)
					userStore
						.updateAvatar(image.value)
						.then(() => {
							router.replace({ name: 'Home' });
						})
						.catch((e) => {
							toast.error(e.response.data.message);
						});
				else router.replace({ name: 'Home' });
			})
			.catch((e) => {
				toast.error(e.response.data.message);
			});
	}
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
</script>

<template>
	<div v-if="userStore.isLoading" class="flex items-center justify-center h-full font-Arlon text-white text-6xl">Loading</div>
	<div v-else class="flex flex-col items-center justify-center h-full pb-32 mx-[8vw]">
		<div class="flex justify-center font-Arlon text-white text-5xl sm:text-6xl m-4">TV PONG<span class="text-white">™</span></div>
		<button-gradient1 v-if="!userStore.isLoggedIn" @click="redirectTo42LoginPage()"><span>Login with 42</span></button-gradient1>
		<BaseCard v-else>
			<form class="flex justify-center items-center gap-8 w-full" @submit.prevent>
				<div class="flex flex-col gap-4 items-center">
					<p class="text-gray-300 text-center w-full">Please choose an username and avatar</p>
					<input
						class="placeholder-gray-500 w-full bg-slate-700 text-center text-white font-medium text-xs px-3 py-2 sm:px-5 sm:py-2.5"
						type="text"
						name="username"
						v-model.trim="username"
						placeholder="Username"
					/>
					<button-gradient1 @click="submitForm">Send</button-gradient1>
				</div>
				<upload-avatar @image-loaded="uploadImage" :image="image"></upload-avatar>
			</form>
		</BaseCard>
	</div>
	<div class="h-full w-full fixed bg-brick bg-fixed bg-bottom bg-cover top-0 left-0 -z-10 [transform:_scale(1.2)]"></div>
</template>

