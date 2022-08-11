<script setup lang="ts">
import QRCode from '@/components/Profile/QRCode.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import UploadAvatar from '@/components/UploadAvatar.vue';

const userStore = useUserStore();
const router = useRouter();
const newUsername = ref(userStore.userData.username);
const image = ref(userStore.userData.avatar);
let isUpload = false;

function uploadImage(imageData: string): void {
	image.value = imageData;
	isUpload = true;
}

function submitProfileForm() {
	if (newUsername.value !== userStore.userData.username) userStore.updateUsername(newUsername.value);
	if (isUpload) userStore.updateAvatar(image.value);
	router.push({ name: 'Profile', params: { username: userStore.userData.username } });
}
</script>

<template>
	<div class="flex flex-col items-center h-full w-full gap-5">
		<h1 class="text-center text-red-200 sm:text-xl mx-6 w-3/4 md:text-xl py-3 border-b-[1px] border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500">Activation 2FA</h1>
		<q-r-code></q-r-code>
		<h1 class="text-center text-red-200 sm:text-xl mx-6 w-3/4 md:text-xl py-3 border-b-[1px] border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500">Edit Profile</h1>
		<div class="flex flex-col justify-center w-3/4 sm:pt-8">
			<h2 class="mb-4 text-red-800 text-lg">Change Username:</h2>
			<div class="flex items-center w-full gap-2 mb-4">
				<p>Username:</p>
				<form class="w-full">
					<input
						class="placeholder-red-200 bg-red-400 w-full text-center font-medium text-xs py-1 px-3 text-red-200 sm:px-5 md:text-sm md:px-8"
						type="text"
						name="username"
						v-model.trim="newUsername"
						placeholder="username"
					/>
				</form>
			</div>
			<h2 class="mb-4 text-red-800 text-lg">Change Avatar:</h2>
			<div class="flex items-center gap-2">
				<upload-avatar @image-loaded="uploadImage"></upload-avatar>
			</div>
		</div>
		<base-button @click="submitProfileForm" class="self-end mr-6 bg-blue-600 py-1 px-5 text-white">Save</base-button>
		<h1 class="text-center text-red-200 sm:text-xl mx-6 w-3/4 md:text-xl py-3 border-b-[1px] border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500">Remove Profile</h1>
		<base-button class="mr-6 bg-blue-600 py-1 px-5 text-white">Delete</base-button>
	</div>
</template>
