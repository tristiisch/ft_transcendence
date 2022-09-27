<script setup lang="ts">
import { useGlobalStore } from '@/stores/globalStore';
import { useUserStore } from '@/stores/userStore';
import { useRoute, useRouter } from 'vue-router';
import { onBeforeMount, ref, computed } from 'vue';
import status from '@/types/Status';
import AuthService from '@/services/AuthService';
import socket from '@/plugin/socketInstance';

const userStore = useUserStore();
const globalStore = useGlobalStore();
const router = useRouter();
const route = useRoute();
const isLoading = ref(false);

onBeforeMount(() => {
	const token_jwt = AuthService.getJwtToken()
	if (token_jwt) {
		isLoading.value = true
		userStore.userAuth.islogin = true
		Promise.all([userStore.fetchAll(), globalStore.fetchAll()])
		.then(() => {
			isLoading.value = false
			socket.auth = { token: token_jwt };
			socket.connect()
		})
		.catch((error) => {
			isLoading.value = false
			router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
		})
	}
})
</script>

<template>
	<base-spinner v-if="isLoading"></base-spinner>
	<router-view v-else></router-view>
	<div v-if="isLoading" class="h-full w-full fixed bg-brick bg-bottom bg-cover top-0 left-0 -z-20 [transform:_scale(1.2)]"></div>
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
