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
			})
			.catch((e: Error) => {
				console.log(e);
			});
		isLoading.value = false
	}
}
</script>

<template>
	<div class="flex justify-center">
		<span class="text-slate-600 pr-2">OFF</span>
		<Toogle @switch-button="toogle2FA"></Toogle>
		<span class="text-slate-600 pl-2">ON</span>
	</div>
	<div v-if="isActivated && !isLoading" class="flex flex-col items-center gap-10">
		<img :src="qrCode" fluid alt="QR code" class="h-40 w-40"/>
		<p class="text-center">Use QR code to register the app with Google Authenticator.</p>
	</div>
</template>
