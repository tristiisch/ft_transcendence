<script setup lang="ts">
import { useGlobalStore } from '@/stores/globalStore';
import { useUserStore } from '@/stores/userStore';
import { useRoute, useRouter } from 'vue-router';
import { onBeforeMount, ref, computed } from 'vue';
import AuthService from '@/services/AuthService';
import TokenService from '@/services/TokenService';
import axios from '@/plugin/axiosInstance';
import socket from '@/plugin/socketInstance';
import { useToast } from 'vue-toastification';
import type User from '@/types/User';

const userStore = useUserStore();
const globalStore = useGlobalStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const isLoading = ref(false);

socket.on("userAdd", (user: User) => {
	globalStore.addUser(user);
});

socket.on("userRemove", (userToRemoveId: number) => {
	globalStore.removeUser(userToRemoveId);
});

onBeforeMount(() => {
	if (TokenService.isLocalToken()) {
	axios.defaults.headers.common['Authorization'] = `Bearer ${TokenService.getLocalToken()}`;

	isLoading.value = true
	AuthService.checkJwtToken()
	.then(() => {
		socket.auth = { token: TokenService.getLocalToken() };
		socket.connect()
		Promise.all([userStore.fetchAll(), globalStore.fetchAll()])
		.then(() => {
			isLoading.value = false
		})
		.catch((error) => {
			isLoading.value = false
			console.log(error)
			router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
		})
	})
	.catch((error) => {
		isLoading.value = false;
		if (error.response) toast.error(error.response.data.message)
		localStorage.clear()
		userStore.userToken = null
		router.replace({ name: 'Login' });
	})
}})
</script>

<template>
	<base-spinner v-if="isLoading"></base-spinner>
	<router-view v-else></router-view>
	<div class="h-full w-full fixed bg-brick bg-bottom bg-cover top-0 left-0 -z-20 [transform:_scale(1.2)]"></div>
</template>

<style>
@font-face {
	font-family: Noir_regular;
	src: url(@/assets/font/Noir_regular.otf);
}

#app {
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

*,
*:before,
*:after {
	box-sizing: border-box;
}

html,
body,
#app {
	height: 100%;
	width: 100%;
	margin: 0;
	padding: 0;
}
</style>
