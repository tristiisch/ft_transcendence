<script setup lang="ts">
import type Notification from '@/types/Notification';
import { ref, onBeforeMount } from 'vue';

const countDown = ref(5)

defineProps<{
  notification: Notification
}>()

function countDownTimer () {
	if (countDown.value > 0) {
		setTimeout(() => {
			countDown.value -= 1
			countDownTimer()
		}, 1000)
	}
}

onBeforeMount(() => {
	countDownTimer ()
})
</script>
	
<template>
	<div class="flex items-center pl-4 py-4 gap-4">
		<img class=" h-11 w-11 shrink-0 rounded-full border-[1px] border-pink-400 object-cover" src='@/assets/invitationGame.jpg'>
		<div class="pl-1">{{ notification.message}} {{ countDown }}</div>
	</div>
</template>
