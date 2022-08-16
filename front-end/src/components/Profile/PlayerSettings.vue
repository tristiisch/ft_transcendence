<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import UploadAvatar from '@/components/UploadAvatar.vue';
import Toogle from '@/components/Leaderboard/ToogleButton.vue';
import AuthService from '@/services/AuthService';

const userStore = useUserStore();
const router = useRouter();

const newUsername = ref(userStore.userData.username);
const image = ref(userStore.userData.avatar);
const mode = ref('2FA');
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

const qrCode = ref<null | string>(null);
const isLoading = ref(false);

function toogle2FA() {
	if (userStore.userData['2fa']) {
		userStore.userData['2fa'] = false;
		AuthService.disable2FA().catch((e: Error) => {
			console.log(e);
		});
	} else {
		userStore.userData['2fa'] = true;
		isLoading.value = true;
		AuthService.enable2FA()
			.then((response) => {
				qrCode.value = response.data;
				isLoading.value = false;
			})
			.catch((e: Error) => {
				isLoading.value = false;
				console.log(e);
			});
	}
}

function fetchQrCode() {
	isLoading.value = true;
	AuthService.getQrCode2FA()
		.then((response) => {
			qrCode.value = response.data;
			isLoading.value = false;
		})
		.catch((e: Error) => {
			isLoading.value = false;
			console.log(e);
		});
}

onBeforeMount(() => {
	console.log(qrCode.value);
	if (userStore.userData['2fa'] && !qrCode.value) fetchQrCode();
});
</script>

<template>
	<div class="flex flex-col items-center h-full w-full px-6 sm:px-8">
		<div class="inline-flex shadow-sm w-full">
			<button @click="mode = '2FA'" class="btn-base rounded-l-md border" :class="mode === '2FA' ? 'bg-blue-600 text-white' : 'bg-red-200 text-gray-800'">2FA</button>
			<button @click="mode = 'Edit'" class="btn-base border-t border-b" :class="mode === 'Edit' ? 'bg-blue-600 text-white' : 'bg-red-200 text-gray-800'">Edit</button>
			<button @click="mode = 'Remove'" class="btn-base rounded-r-md border" :class="mode === 'Remove' ? 'bg-blue-600 text-white' : 'bg-red-200 text-gray-800'">Account</button>
		</div>
		<div v-if="mode === '2FA'" class="flex flex-col justify-center items-center gap-8 h-full w-full">
			<div class="flex justify-center w-full">
				<span class="text-red-200 pr-2">OFF</span>
				<Toogle twoFa @switch-button="toogle2FA"></Toogle>
				<span class="text-red-200 pl-2">ON</span>
			</div>
			<div v-if="isLoading" class="font-Arlon text-white text-center text-6xl w-full">Loading</div>
			<div v-if="qrCode && userStore.userData['2fa'] && !isLoading" class="flex flex-col items-center w-full">
				<img :src="qrCode" fluid alt="QR code" class="w-28 md:w-32 lg:w-40" />
			</div>
			<p class="text-center text-red-200 text-xs sm:text-sm">When 2FA is enable scan the QRCode in Google's Authenticator app.</p>
		</div>
		<form v-else-if="mode === 'Edit'" class="flex flex-col items-center justify-between h-full w-full" @submit.prevent>
			<div class="flex flex-col justify-center h-full w-full sm:w-fit gap-6 sm:gap-14">
				<div class="flex flex-col justify-center w-full">
					<label class="block mb-2 text-sm font-medium text-red-200">Change Username:</label>
					<input
						class="placeholder-red-600 bg-red-400 w-full rounded-md text-center font-medium text-xs py-1.5 text-red-200"
						type="text"
						v-model.trim="newUsername"
					/>
				</div>
				<div class="flex flex-col items-center w-full sm:flex-row sm:gap-4">
					<img class="self-end -mb-4 sm:mb-0 shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded object-cover border-[1px] border-zinc-300" :src="image" alt="Rounded avatar" />
					<div class="flex flex-col">
						<label class="block mb-2 text-sm font-medium text-red-200">Change avatar:</label>
						<upload-avatar @image-loaded="uploadImage"></upload-avatar>
					</div>
				</div>
			</div>
			<base-button @click="submitProfileForm" class="self-end bg-blue-600 py-1 px-5 text-white">Save</base-button>
		</form>
		<div v-else-if="mode === 'Remove'" class="flex flex-col items-center justify-center gap-8 h-full w-full">
			<p class="text-center text-red-200 text-xs sm:text-sm">You can delete your account below. Profile deletion is irreversible and you will lost all your data.</p>
			<base-button class="bg-blue-600 py-1 px-5 text-white">Delete</base-button>
		</div>
	</div>
</template>

<style scoped>
.btn-base {
	@apply w-1/3 py-2 px-4 text-xs font-medium border-red-100 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white;
}
</style>
