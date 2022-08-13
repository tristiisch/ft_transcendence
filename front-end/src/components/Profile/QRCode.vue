<script setup lang="ts">
import AuthService from '@/services/AuthService';
import Toogle from '@/components/Leaderboard/ToogleButton.vue';
import { ref } from 'vue';

const qrCode = ref('');
const isActivated = ref(false);
const isLoading = ref(false);

function toogle2FA() {
	if (isActivated.value) {
		isActivated.value = false;
		AuthService.disable2FA().catch((e: Error) => {
			console.log(e);
		});
	} else {
		isActivated.value = true;
		isLoading.value = true
		AuthService.enable2FA()
			.then((response) => {
				qrCode.value = response.data;
				isLoading.value = false
			})
			.catch((e: Error) => {
				isLoading.value = false
				console.log(e);
			});

	}
}
</script>

<template>
	<div class="flex justify-center w-full">
		<span class="text-slate-600 text-bold pr-2">OFF</span>
		<Toogle @switch-button="toogle2FA"></Toogle>
		<span class="text-slate-600 pl-2">ON</span>
	</div>
	<div v-if="isLoading" class="font-Arlon text-white text-center text-6xl w-full">Loading</div>
	<div v-if="isActivated && !isLoading" class="flex flex-col items-center w-full">
		<img :src="qrCode" fluid alt="QR code" class="w-28 md:w-32 lg:w-40"/>
	</div>
	<p class="text-center text-red-200 text-xs sm:text-sm">When 2FA is enable scan the QRCode in Google's Authenticator app.</p>
</template>
