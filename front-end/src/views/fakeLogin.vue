<script setup lang="ts">

import { useUserStore } from "@/stores/userStore"
import socket from "@/plugin/socketInstance"
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';

const userStore = useUserStore();
const router = useRouter();
const toast = useToast()
const route = useRoute();

userStore.handleFakeLogin(route.params.username as string).then(() => {
	if (userStore.isRegistered && !userStore.userAuth.has_2fa)
	{
		socket.auth = { token: userStore.userAuth.token_jwt };
		socket.connect()
		router.replace({ name: 'Home' });
	}
})
.catch((e) => {
	if (e.response.data) toast.error(e.response.data.message);
	userStore.handleLogout()
});

</script>

<template>
	<h1>Connecting...</h1>
</template>
