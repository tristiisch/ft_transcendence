<script setup lang="ts">
import Status from '@/types/Status';
import type User from '@/types/User';
import PlayerStatus from '@/components/PlayerStatus.vue';
import UploadAvatar from '@/components/UploadAvatar.vue';
import { useUserStore } from '@/stores/userStore';
import { ref, watch } from 'vue';

const props = defineProps<{
	user: User;
}>();

const image = ref(props.user.avatar);

function uploadImage(imageData: string): void {
	image.value = imageData;
}

watch(
	() => props.user.avatar,
	() => {
		image.value = props.user.avatar;
	}
);

</script>

<template>
	<div class="self-center flex flex-col justify-around items-center gap-3 pt-4 sm:pt-0 pl-3 sm:pl-0 sm:max-w-full">
		<img class="w-20 h-20 rounded-full object-cover border-2 sm:w-36 sm:h-36" :src="user.avatar" alt="Rounded avatar" />
		<div class="flex gap-2 sm:gap-5">
			<player-status :user="user"></player-status>
			<span class="text-xl sm:text-3xl">{{ user.username }}</span>
		</div>
	</div>
</template>
