<script setup lang="ts">
import { useGlobalStore } from '@/stores/globalStore';
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';
import { useToast } from 'vue-toastification';
import TokenService from '@/services/TokenService';
import UserService from '@/services/UserService';
import axios from '@/plugin/axiosInstance';
import socket from '@/plugin/socketInstance';
import type User from '@/types/User';

const userStore = useUserStore();
const globalStore = useGlobalStore();
const chatStore = useChatStore();
const toast = useToast();

if (TokenService.isLocalToken()) {
	axios.defaults.headers.common['Authorization'] = `Bearer ${TokenService.getLocalToken()}`;
	socket.auth = { token: TokenService.getLocalToken() }
	UserService.getMe()
		.then((response) => {
			socket.connect()
			userStore.userData = response.data;
		})
		.catch((e) => {
			if (e.response.data) toast.error(e.response.data.message)
			else toast.error("Something went wrong")
			userStore.handleLogout();
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

*, *:before, *:after {
  box-sizing: border-box;
}

html, body, #app { height: 100%; width: 100%; margin:0; padding:0; }

</style>
