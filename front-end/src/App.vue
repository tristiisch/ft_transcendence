<script setup lang="ts">
import axios from '@/plugin/axiosInstance';
import UserService from '@/services/UserService';
import { useUserStore } from '@/stores/userStore';
import { useToast } from 'vue-toastification';

const userStore = useUserStore();
const toast = useToast();
const authString = localStorage.getItem('userAuth');

if (authString && userStore.isLoggedIn) {
	console.log(authString)
	console.log(userStore.userData.username)
	axios.defaults.headers.common['Authorization'] = `Bearer ${JSON.parse(authString).token}`;
	UserService.getMe(JSON.parse(authString).user_id)
		.then((response) => {
			userStore.userData = response.data;
		})
		.catch((e) => {
			toast.error(e.response.data.message)
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
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

*, *:before, *:after {
  box-sizing: border-box;
}

html, body, #app { height: 100%; width: 100%; margin:0; padding:0; }

</style>
