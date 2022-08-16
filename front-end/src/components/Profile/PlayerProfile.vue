<script setup lang="ts">
import Status from '@/types/Status';
import type User from '@/types/User';
import PlayerStatus from '@/components/PlayerStatus.vue';
import { useUserStore } from '@/stores/userStore';
import { ref, watch } from 'vue';

const props = defineProps<{
	user: User;
}>();

const userStore = useUserStore();

function isUser() {
	if (props.user.username === userStore.userData.username) return true;
	return false;
}

</script>

<template>
	<div class="self-center flex flex-col justify-around items-center gap-3 pt-4 sm:pt-0 pl-3 sm:pl-0 sm:max-w-full">
		<img class="w-20 h-20 rounded-full object-cover border-2 sm:w-36 sm:h-36" :src="user.avatar" alt="Rounded avatar" />
		<div class="flex gap-2 sm:gap-5">
			<player-status :user="user"></player-status>
			<span class="text-slate-700 text-xl sm:text-3xl">{{ user.username }}</span>
			 <base-button link :to="{ name: 'Chat', query: { discussion: user.username }} ">
				<svg v-if="!isUser()" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
					/>
				</svg>
			 </base-button>
		</div>
	</div>
</template>
