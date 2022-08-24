<script setup lang="ts">
import type Discussion from '@/types/Discussion';
import type Channel from '@/types/Channel';
import baseButton from '@/components/BaseButton.vue'

defineProps<{
	inDiscussion: Discussion | null;
	inChannel: Channel | null;
}>();

</script>

<template>
	<div v-if="inDiscussion" class="flex flex-col items-center -mt-3 sm:-mt-5">
		<base-button  link :to="{ name: 'Profile', params: { id: inDiscussion.user.id }}" class="pb-2">
			<img class="h-8 w-8 sm:h-12 sm:w-12 shrink-0 rounded-full border border-red-400" :src=inDiscussion.user.avatar>
		</base-button>
		<div class="flex items-center w-full">
			<span class="border-b-[1px] border-red-400 w-full"></span>
			<h1 class="shrink-0 text-red-200 px-3 max-w-[80%] truncate">{{ inDiscussion.user.username }}</h1>
			<span class="border-b-[1px] border-red-400 w-full"></span>
		</div>
	</div>
	<div v-else-if="inChannel" class="flex flex-col items-center -mt-5">
		<div class="flex justify-center -space-x-3 sm:-space-x-5 pb-2 overflow-x-auto">
			<base-button  v-for="user in inChannel.users" link :to="{ name: 'Profile', params: { id: user.id }}" class="flex shrink-0">
				<img class="h-8 w-8 sm:h-12 sm:w-12 shrink-0 rounded-full border-[1px] border-red-400" :src=user.avatar>
			</base-button>
		</div>
		<div class="flex items-center w-full">
			<span class="border-b-[1px] border-red-400 w-full"></span>
			<h1 class="shrink-0 text-red-200 px-3 max-w-[80%] truncate">{{ inChannel.name }}</h1>
			<span class="border-b-[1px] border-red-400 w-full"></span>
		</div>
	</div>
</template>
