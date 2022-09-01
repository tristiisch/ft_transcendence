<script setup lang="ts">
import axios from '@/plugin/axiosInstance';
import UserService from '@/services/UserService';
import TokenService from '@/services/TokenService';
import { useUserStore } from '@/stores/userStore';
import socket from '@/plugin/socketInstance';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

if (TokenService.isLocalToken()) {
	axios.defaults.headers.common['Authorization'] = `Bearer ${TokenService.getLocalToken()}`;
	socket.auth = { token: TokenService.getLocalToken() }
	UserService.getMe()
		.then((response) => {
			socket.connect()
			userStore.userData = response.data;
		})
		.catch((error) => {
			if (error.response.status !== 401)
			{
				console.log(error.response.data.message)
				userStore.removeToken()
				router.replace({ name: 'Login' });
			}
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
