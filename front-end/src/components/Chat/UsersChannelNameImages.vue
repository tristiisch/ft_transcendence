<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import baseButton from '@/components/Ui/BaseButton.vue'

const chatStore = useChatStore();
</script>

<template>
	<div v-if="chatStore.inDiscussion" class="flex flex-col items-center -mt-3 sm:-mt-5">
		<base-button  link :to="{ name: 'Profile', params: { id: chatStore.inDiscussion.user.id }}">
			<img class="h-8 w-8 sm:h-12 sm:w-12 shrink-0 rounded-full object-cover border border-red-400" :src=chatStore.inDiscussion.user.avatar>
		</base-button>
		<div class="flex items-center w-full pb-1 pt-2">
			<span class="border-b-[1px] border-red-400 w-full"></span>
			<h1 class="shrink-0 text-red-200 px-3 max-w-[80%] truncate">{{ chatStore.inDiscussion.user.username }}</h1>
			<span class="border-b-[1px] border-red-400 w-full"></span>
		</div>
	</div>
	<div v-else-if="chatStore.inChannel" class="flex flex-col items-center -mt-3 sm:-mt-5">
		<div :class="chatStore.inChannel.users.length === 1 ? '' : 'pl-3 sm:pl-5'" class="flex -space-x-3 sm:-space-x-5 overflow-y-auto flex-wrap max-h-[32px] sm:max-h-[48px]">
			<base-button  v-for="user in chatStore.inChannel.users" link :to="{ name: 'Profile', params: { id: user.id }}" class="flex shrink-0">
				<img class="h-8 w-8 sm:h-12 sm:w-12 shrink-0 rounded-full object-cover border-[1px] border-red-400" :src=user.avatar>
			</base-button>
		</div>
		<div class="flex items-center w-full pb-1 pt-2">
			<span class="border-b-[1px] border-red-400 w-full"></span>
			<h1 class="shrink-0 text-red-200 px-3 max-w-[80%] truncate">{{ chatStore.inChannel.name }}</h1>
			<span class="border-b-[1px] border-red-400 w-full"></span>
		</div>
	</div>
</template>
