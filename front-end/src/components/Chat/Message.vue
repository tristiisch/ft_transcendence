<script setup lang="ts">
import users from '@/data/users';
import { useUserStore } from '@/stores/userStore';
import { ref, watch, onUpdated } from 'vue'
import type User from '@/types/User';

const userStore = useUserStore();

defineProps<{
	messages: {message: string, sender: string, date: string}[];
    users: User[];
}>();

const emit = defineEmits<{
	(e: 'scroll'): void
}>();

function searchPlayerAvatar(sender: string) {
    console.log(sender)
    let avatar = (users.find(element => element.username === sender))?.avatar;
    console.log(avatar);
    return avatar;
}

onUpdated(()=> {
    emit('scroll')
});

</script>

<template>
    <div v-for="message in messages" :key="message.date" class="flex gap-2 w-full mt-5">
		<img class="self-center h-8 w-8 shrink-0 rounded-full border-[1px] border-red-400 sm:self-start" :src="searchPlayerAvatar(message.sender)">
		<div class="flex flex-col gap-1 min-w-0">
			<div class="flex flex-col sm:items-center sm:gap-2 pt-1 text-red-300 sm:flex-row">
				<p class="text-sm ">{{ message.sender }}</p>
				<p class="text-xs">{{ message.date.toLocaleString() }}</p>
			</div> 
			<div class="text-sm min-w-0 text-red-200 break-words">{{ message.message }}</div>
		</div>
    </div>
</template>