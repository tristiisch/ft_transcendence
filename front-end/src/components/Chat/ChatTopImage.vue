<script setup lang="ts">
import type User from '@/types/User';
import type Channel from '@/types/Channel';
import baseButton from '@/components/BaseButton.vue'

defineProps<{
	inChatWith: User | null;
	inChannel: Channel | null;
}>();

const emit = defineEmits<{
	(event: 'clickOnChannelSettings'): void;
}>();
</script>

<template>
	<base-button v-if="inChatWith" link :to="{ name: 'Profile', params: { username: inChatWith.username }}" class="flex justify-center items-center gap-4 -mt-3 sm:-mt-5 pb-2 sm:pb-5 w-full border-b-[1px] border-red-400">
		<img class="h-8 w-8 sm:h-12 sm:w-12 shrink-0 rounded-full border-[1px] border-red-400" :src=inChatWith.avatar>
		<label class="text-red-100">{{ inChatWith.username }}</label>
	</base-button>
	<div v-else-if="inChannel" class="flex flex-col items-center">
		<div class="flex justify-between items-center -mt-5 gap-5 w-full">
			<button @click="emit('clickOnChannelSettings')" class="pb-2 shrink-0">
				<img class="h-8 w-8 sm:h-12 sm:w-12 rounded border-[1px] border-red-400" src='@/assets/ChannelDefault.png'>
			</button>
			<div class="flex -space-x-3 sm:-space-x-5 pb-2 overflow-x-auto">
				<base-button  v-for="user in inChannel.users" link :to="{ name: 'Profile', params: { username: user.username }}" class="flex shrink-0">
					<img class="h-8 w-8 sm:h-12 sm:w-12 shrink-0 rounded-full border-[1px] border-red-400" :src=user.avatar>
				</base-button>
			</div>
		</div>
		<div class="flex items-center w-full">
			<span class="border-b-[1px] border-red-400 w-full"></span>
			<h1 class="shrink-0 text-red-200 px-3 max-w-[80%] truncate">{{ inChannel.name }}</h1>
			<span class="border-b-[1px] border-red-400 w-full"></span>
		</div>
	</div>
</template>