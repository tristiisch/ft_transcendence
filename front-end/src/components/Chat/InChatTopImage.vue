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
	<base-button v-if="inChatWith" link :to="{ name: 'Profile', params: { username: inChatWith.username }}" class="flex justify-center items-center gap-4 -mt-5 pb-5 w-full border-b-[1px] border-red-400">
		<img class="h-8 w-8 sm:h-12 sm:w-12 shrink-0 rounded-full border-[1px] border-red-400" :src=inChatWith.avatar>
		<label class="text-red-100">{{ inChatWith.username }}</label>
	</base-button>
	<div v-else-if="inChannel" class="flex justify-between items-center gap-4 -mt-5 pb-5 w-full border-b-[1px] border-red-400">
		<button @click="emit('clickOnChannelSettings')" class="flex items-center gap-2">
			<img class="h-8 w-8 sm:h-12 sm:w-12 shrink-0 rounded border-[1px] border-red-400" src='@/assets/ChannelDefault.png'>
			<label class="text-red-100">{{ inChannel.name }}</label>
		</button>
		<div class="flex -space-x-3 sm:-space-x-5">
			<base-button  v-for="user in inChannel.users" link :to="{ name: 'Profile', params: { username: user.username }}" class="flex shrink-0">
				<img class="h-8 w-8 sm:h-12 sm:w-12 shrink-0 rounded-full border-[1px] border-red-400" :src=user.avatar>
			</base-button>
		</div>
	</div>
</template>