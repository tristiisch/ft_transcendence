<script setup lang="ts">
import Status from '@/types/Status';
import type User from '@/types/User';
import PlayerStatus from '@/components/PlayerStatus.vue';
import UploadAvatar from '@/components/Login/UploadAvatar.vue';
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
	<div class="self-center flex flex-col justify-around items-center gap-3 pt-4 pl-3 sm:pl-0 sm:max-w-full">
		<upload-avatar @image-loaded="uploadImage" :image="image"></upload-avatar>
		<div class="flex gap-2 sm:gap-5">
			<player-status :user="user"></player-status>
			<span class="text-xl md:text-3xl">{{ user.username }}</span>
		</div>
	</div>
</template>
