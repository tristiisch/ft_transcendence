<script setup lang="ts">
import { ref, onBeforeMount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import UploadAvatar from '@/components/UploadAvatar.vue';
import Toogle from '@/components/Leaderboard/ToogleButton.vue';
import { useToast } from 'vue-toastification';
import AuthService from '@/services/AuthService';

const userStore = useUserStore();
const router = useRouter();
const toast = useToast();

const newUsername = ref(userStore.userData.username);
const newAvatar = ref(userStore.userData.avatar);
const mode = ref('2FA');
let isUpload = false;

function uploadImage(imageData: string): void {
	newAvatar.value = imageData;
	isUpload = true;
}

function submitProfileForm() {
	if (userStore.userData.avatar !== newAvatar.value)
	{
		userStore
		.updateAvatar(newAvatar.value)
		.catch((e) => {
			toast.error(e.response.data.message);
		});
	}
	if (userStore.userData.username !== newUsername.value)
	{
		userStore
		.updateUsername(newUsername.value)
		.then(() => {
			router.push({ name: 'Profile', params: { username: userStore.userData.username } });
		})
		.catch((e) => {
			toast.error(e.response.data.message);
		});
	}
}

const qrCode = ref<null | string>(null);
const isLoading = ref(false);

function toogle2FA() {
	if (userStore.userAuth.has_2fa) {
		userStore.userAuth.has_2fa = false;
		AuthService.disable2FA()
			.then(() => {
				userStore.update2FA(false);
			})
			.catch((e: Error) => {
				console.log(e);
			});
	} else {
		isLoading.value = true;
		AuthService.enable2FA()
			.then((response) => {
				qrCode.value = response.data;
				userStore.update2FA(true);
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

function cancelProfileForm() {
	newUsername.value = userStore.userData.username;
	newAvatar.value = userStore.userData.avatar;
}

watch(
	() => userStore.userData.avatar,
	() => {
		newAvatar.value = userStore.userData.avatar;
	}
);

onBeforeMount(() => {
	console.log(qrCode.value);
	if (userStore.userAuth.has_2fa && !qrCode.value) fetchQrCode();
});
</script>

<template>
	<div class="flex flex-col items-center h-full w-full px-6 sm:px-8">
		<div class="inline-flex shadow-sm w-full">
			<button @click="mode = '2FA'" class="btn-base rounded-l-md border" :class="mode === '2FA' ? 'bg-blue-600 text-neutral-100' : 'bg-neutral-100 text-blue-600'">2FA</button>
			<button @click="mode = 'Edit'" class="btn-base border-t border-b" :class="mode === 'Edit' ? 'bg-blue-600 text-neutral-100' : 'bg-neutral-100 text-blue-600'">Edit</button>
			<button @click="mode = 'Remove'" class="btn-base rounded-r-md border" :class="mode === 'Remove' ? 'bg-blue-600 text-neutral-100' : 'bg-neutral-100 text-blue-600'">Account</button>
		</div>
		<div v-if="mode === '2FA'" class="flex flex-col justify-center items-center gap-8 h-full w-full">
			<div class="flex justify-center w-full">
				<span class="text-red-200 pr-2">OFF</span>
				<Toogle twoFa @switch-button="toogle2FA"></Toogle>
				<span class="text-red-200 pl-2">ON</span>
			</div>
			<div v-if="isLoading" class="font-Arlon text-white text-center text-6xl w-full">Loading</div>
			<div v-if="qrCode && userStore.userAuth.has_2fa && !isLoading" class="flex flex-col items-center w-full">
				<img :src="qrCode" fluid alt="QR code" class="w-24 sm:w-36" />
			</div>
			<p class="text-center text-red-200 text-xs sm:text-sm">When 2FA is enable scan the QRCode in Google's Authenticator app.</p>
		</div>
		<form v-else-if="mode === 'Edit'" class="flex flex-col items-center justify-between h-full w-full" @submit.prevent>
			<div class="flex flex-col justify-center items-center h-full w-full gap-4 sm:gap-8">
				<div class="flex flex-col justify-center items-center w-full">
					<label class="block mb-2 text-sm text-center text-red-200">Change username</label>
					<input
						class="placeholder-slate-300 bg-neutral-100 border border-blue-600 rounded-lg text-center w-[184px] text-xs py-1 sm:py-1.5 text-blue-600"
						type="text"
						v-model.trim="newUsername"
						placeholder="Username"
					/>
				</div>
				<div class="flex flex-col justify-center w-full">
					<label class="block mb-2 text-sm text-center text-red-200">Change avatar</label>
					<div class="flex justify-center gap-6">
						<img class="shrink-0 w-10 h-10 sm:w-20 sm:h-20 rounded object-cover border border-neutral-100" :src="newAvatar" alt="Rounded avatar" />
						<upload-avatar @image-loaded="uploadImage"></upload-avatar>
					</div>
				</div>
				<div class="flex gap-6">
					<base-button @click="submitProfileForm" class="text-sm w-20 py-2 mt-6 rounded-lg bg-neutral-100 text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-neutral-100">Save</base-button>
					<base-button @click="cancelProfileForm" class="text-sm w-20 py-2 mt-6 rounded-lg bg-neutral-100 text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-neutral-100">Cancel</base-button>
				</div>
			</div>
		</form>
		<div v-else-if="mode === 'Remove'" class="flex flex-col items-center justify-center gap-8 h-full w-full">
			<p class="text-center text-red-200 text-xs sm:text-sm">You can delete your account below. Profile deletion is irreversible and you will lost all your data.</p>
			<base-button class="text-sm py-2 px-3 rounded-lg bg-neutral-100 text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-neutral-100">Delete</base-button>
		</div>
	</div>
</template>

<style scoped>
.btn-base {
	@apply w-1/3 py-1.5 sm:py-2.5 text-xs sm:text-sm border-blue-600 hover:bg-blue-600 hover:text-neutral-100 focus:bg-blue-600 focus:text-neutral-100;
}
</style>
