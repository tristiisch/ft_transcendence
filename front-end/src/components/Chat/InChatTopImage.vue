<script setup lang="ts">
import type User from '@/types/User';
import type Channel from '@/types/Channel';
import { ref } from 'vue';
import { stringify } from 'querystring';

const count = ref(0)

defineProps<{
	inChatWith: User | null;
	inChannel: Channel | null;
}>();
</script>

<template>
	<div v-if="inChatWith" class="flex justify-center items-center gap-4 -mt-5 pb-2 w-full border-b-[1px] border-red-400">
		<img class="h-12 w-12 shrink-0 rounded-full border-[1px] border-red-400" :src=inChatWith.avatar>
		<label class="text-red-100">{{ inChatWith.username }}</label>
	</div>
	<div v-else-if="inChannel" class="flex justify-center items-center gap-4 -mt-5 pb-2 w-full border-b-[1px] border-red-400">
		<div class="flex -space-x-5">
			<div v-for="user in inChannel.users" class="flex">
				<img class="h-12 w-12 shrink-0 rounded-full border-[1px] border-red-400" :src=inChannel.avatar>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<img class="h-12 w-12 shrink-0 ml-4 rounded border-[1px] border-red-400" src='@/assets/ChannelDefault.png'>
			<label class="text-red-100">{{ inChannel.name }}</label>
		</div>
	</div>
</template>