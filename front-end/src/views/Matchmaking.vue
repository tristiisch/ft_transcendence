<script setup lang="ts">

import { onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import useMatchService from '@/services/MatchService';
import socket from '@/plugin/socketInstance';

const MatchService = useMatchService
const router = useRouter()
const userStore = useUserStore();
const userData = userStore.userData

socket.emit('findMatch')
socket.on('foundMatch', (id) => {
	router.replace('match/' + id)
})

</script>

<template>
	<base-spinner game></base-spinner>
</template>