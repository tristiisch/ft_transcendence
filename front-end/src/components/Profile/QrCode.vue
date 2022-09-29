<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import AuthService from '@/services/AuthService';
import Toogle from '@/components/Divers/ToogleButton.vue';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const twoFaCode = ref<number | null>(null);
const isLoading = ref(false);
const qrCode = ref('');

function toogle2FA() {
	if (qrCode.value != '' || userStore.userAuth.has_2fa) {
		AuthService.disable2FA()
			.then(() => {
				userStore.update2FA(false);
				qrCode.value = ''
			})
			.catch((error) => {
				router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
			});
	} else {
		isLoading.value = true;
		AuthService.getQrCode2FA()
			.then((response) => {
				qrCode.value = response.data
				isLoading.value = false;
			})
			.catch((error) => {
				router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
			});
	}
}

function validate2FA() {
	if (twoFaCode.value)
	{
		AuthService.enable2FA(twoFaCode.value)
		.then(() => {
			userStore.update2FA(true);
			qrCode.value = ''
		})
		.catch((error) => {
			if (error.response?.status === 403) toast.error(error.response?.data?.message)
			else router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
		});
	}
}
</script>

<template>
	<base-spinner small v-if="isLoading"></base-spinner>
	<div v-else class="flex flex-col justify-center items-center h-full w-full gap-4 sm:gap-8 sm:mt-3">
		<div v-if="!qrCode" class="flex flex-col justify-center gap-4 w-full">
			<div class="flex justify-center w-full">
				<span class="text-red-200 pr-2">OFF</span>
				<Toogle twoFa @switch-button="toogle2FA"></Toogle>
				<span class="text-red-200 pl-2">ON</span>
			</div>
			<p v-if="!userStore.userAuth.has_2fa" class="text-center text-red-200 text-xs sm:text-sm">Your 2FA is <span class="text-red-700">disable</span></p>
			<p v-if="userStore.userAuth.has_2fa" class="text-center text-red-200 text-xs sm:text-sm">Your 2FA is <span class="text-red-700">enable</span></p>
		</div>
		<div v-if="qrCode && !isLoading" class="flex justify-center w-full">
			<img :src="qrCode" alt="QR code" class="w-20 sm:w-32" />
		</div>
		<form v-if="qrCode" class="flex flex-col w-full text-center text-xs sm:text-sm gap-4" @submit.prevent>
			<div class="flex flex-col">
				<h1 class="text-lime-400">⚠️ 2FA activation is not over</h1>
				<p class="text-red-100 text-xs">Please scan the QRCode in Google's Authenticator and send the 2FA code</p>
			</div>
			<div class="flex justify-center w-full gap-4">
				<input type="password" name="twoFaCode" v-model="twoFaCode" placeholder="2FA code" class="text-center text-xs text-blue-600 placeholder:text-slate-300 bg-neutral-100 border border-blue-600 rounded-lg placeholder:text-center" />
				<base-button @click="validate2FA" class="text-sm w-20 py-1 sm:py-2 rounded-lg bg-neutral-100 text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-neutral-100">Send</base-button>
			</div>
		</form>
	</div>
</template>
