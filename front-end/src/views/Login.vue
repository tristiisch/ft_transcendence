<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useToast } from 'vue-toastification';
import { ref, watch, onBeforeMount } from 'vue';
import { onBeforeRouteLeave } from 'vue-router'
import { useGlobalStore } from '@/stores/globalStore';
import socket from '@/plugin/socketInstance';
import BaseCard from '@/components/Ui/BaseCard.vue';
import ButtonGradient from '@/components/Button/ButtonGradient.vue';
import UploadAvatar from '@/components/Divers/UploadAvatar.vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const toast = useToast();
const globalStore = useGlobalStore();

const username = ref(userStore.userData.login_42);
const image = ref(userStore.userData.avatar);
const twoFaCode = ref('');
const isLoading = ref(false);

function redirectTo42LoginPage(): void {
	const baseUrl = import.meta.env.VITE_FT_API_OAUTH;
	const randomString = (Math.random() + 1).toString(36).substring(2);
	sessionStorage.setItem('state', randomString)

	const options = {
		client_id: import.meta.env.VITE_FT_UID,
		redirect_uri: `${window.location.protocol}//${window.location.host}/login`,
		scope: 'public',
		state: randomString,
		response_type: 'code',
	};

	const queryString = new URLSearchParams(options).toString();
	window.location.href = `${baseUrl}?${queryString}`
}

function uploadImage(imageData: string, fileSize:number): void {
	image.value = imageData;
}

watch(
	() => userStore.userData.login_42,
	() => {
		username.value = userStore.userData.login_42;
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
	.handleLogin2Fa(twoFaCode.value)
	.then(() => {
		router.replace({ name: 'Home' });
	})
	.catch((error) => {
		if (error.response?.status === 403) toast.error(error.response?.data?.message)
		else if (error.response?.status === 0) toast.error("Network Error: unable to connect to server")
		else userStore.handleLogout()
	});
}

function onlyLettersAndNumbers(str: string) {
	return /^[A-Za-z0-9]*$/.test(str);
}

function submitRegistrationForm() {
	if (!username.value || !(username.value.length > 2 && username.value.length <= 10)) toast.warning('Username should have at least 3 and at most 10 characters.');
	else if (!onlyLettersAndNumbers(username.value)) toast.warning('Username can only contain alphanumeric characters.');
	else {
		isLoading.value = true;
		userStore
			.registerUser(username.value, image.value)
			.then(() => {
				router.replace({ name: 'Home' });
			})
			.catch((error) => {
				isLoading.value = false;
				if (error.response?.status === 403 || error.response?.status === 412 || error.response?.status === 400) toast.error(error.response?.data?.message)
				else if (error.response?.status === 0) toast.error("Network Error: unable to connect to server")
				else userStore.handleLogout()
			});
	}
}

onBeforeRouteLeave((to, _) => {
	if (to.name === 'Home')
	{
		socket.auth = { token: userStore.userAuth.token_jwt }
		socket.connect()
		isLoading.value = true;
		globalStore
			.fetchAll()
			.then(() => {
				isLoading.value = false;
			})
			.catch((error) => {
				router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status } });
			});
	}
})

onBeforeMount(() => {
	if (route.query.code !== undefined && route.query.state !== undefined && !userStore.isLoggedIn) {
		isLoading.value = true;
		userStore.handleLogin(route.query.code as string, route.query.state as string)
		.then(() => {
			if (userStore.isRegistered && !userStore.userAuth.has_2fa) router.replace({ name: 'Home' });
			else isLoading.value = false;
		})
		.catch((error) => {
			isLoading.value = false;
			if (error.response?.data) toast.error(error.response?.data?.message)
			else if (error.response?.status === 0) toast.error("Network Error: unable to connect to server")
			router.replace({ name: 'Login' });
		});
	}
});
</script>

<template>
	<base-spinner v-if="isLoading"></base-spinner>
	<div v-else class="flex flex-col items-center justify-center pb-32 h-full mx-[8vw]">
		<div class="font-Arlon text-white text-5xl sm:text-6xl m-4">TV PONG<span class="text-white">™</span></div>
		<button-gradient v-if="!userStore.userAuth.token_jwt" @click="redirectTo42LoginPage()">Login with 42 </button-gradient>
		<BaseCard v-else-if="!userStore.isRegistered && !userStore.userAuth.has_2fa">
			<form class="flex justify-center items-center gap-4 sm:gap-8 w-full" @submit.prevent="submitRegistrationForm">
				<div class="flex flex-col gap-4 items-center">
					<p class="text-slate-500 text-center w-full">Please choose an username and avatar</p>
					<input
						class="text-center text-neutral-100 text-xs px-3 py-2 sm:px-5 sm:py-2.5 w-full rounded bg-slate-800 placeholder-slate-600 placeholder:text-center"
						type="text"
						name="username"
						v-model.trim="username"
						placeholder="Username"
					/>
					<button-gradient @click="submitRegistrationForm">Send</button-gradient>
				</div>
				<upload-avatar login @image-loaded="uploadImage" :image="image"></upload-avatar>
			</form>
		</BaseCard>
		<BaseCard v-else-if="userStore.userAuth.has_2fa">
			<form class="flex flex-col justify-center items-center gap-4" @submit.prevent="submit2faForm">
				<h1 class="text-lime-400">⚠️ Two Factor Authentification enabled</h1>
				<p class="text-slate-500">Please enter your 2FA code below</p>
				<div class="flex justify-center gap-4">
					<input
						type="password"
						name="twoFaCode"
						v-model="twoFaCode"
						placeholder="2FA code"
						class="text-center text-neutral-100 placeholder:text-slate-600 bg-slate-800 rounded placeholder:text-center"
					/>
					<button-gradient @click="submit2faForm">Send</button-gradient>
				</div>
			</form>
		</BaseCard>
	</div>
	<div class="h-full w-full fixed bg-brick bg-bottom bg-cover top-0 left-0 -z-20 [transform:_scale(1.2)]"></div>
</template>
