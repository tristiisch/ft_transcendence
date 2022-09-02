<script setup lang="ts">
import axios from '@/plugin/axiosInstance';
import UserService from '@/services/UserService';
import TokenService from '@/services/TokenService';
import { useUserStore } from '@/stores/userStore';
import socket from '@/plugin/socketInstance';
import { useToast } from 'vue-toastification';

const userStore = useUserStore();
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
