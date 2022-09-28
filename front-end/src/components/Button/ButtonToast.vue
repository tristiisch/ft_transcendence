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
	<div class="flex items-center">
		<img class=" h-11 w-11 shrink-0 rounded-full border-[1px] border-pink-400 object-cover" src='@/assets/invitationGame.jpg'>
		<div class="flex flex-col pl-4">
			<p>{{ notification.message}}</p>
			<p>Game start in {{ countDown }}<span class="pl-2">🚀</span></p>
		</div>
	</div>
</template>
