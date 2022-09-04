<script setup lang="ts">
import { useGlobalStore } from '@/stores/globalStore';
import { useUserStore } from '@/stores/userStore';
import { useRoute, useRouter } from 'vue-router';
import TokenService from '@/services/TokenService';
import axios from '@/plugin/axiosInstance';
import socket from '@/plugin/socketInstance';
import type User from '@/types/User';

const userStore = useUserStore();
const globalStore = useGlobalStore();
const router = useRouter();
const route = useRoute();

if (TokenService.isLocalToken()) {
	axios.defaults.headers.common['Authorization'] = `Bearer ${TokenService.getLocalToken()}`;
	socket.auth = { token: TokenService.getLocalToken() };

	userStore.fetchMe().catch((error) => {
		console.log(error);
		router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
	});

	globalStore.isLoading = true
	globalStore
		.fetchAll()
		.then(() => {
			globalStore.isLoading = false;
		})
		.catch((error) => {
			console.log(error);
			router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
		});
}

socket.on("userAdd", (user: User) => {
	globalStore.addUser(user);
});

socket.on("userRemove", (userToRemoveId: number) => {
	globalStore.removeUser(userToRemoveId);
});
</script>

<template>
	<router-view></router-view>
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
