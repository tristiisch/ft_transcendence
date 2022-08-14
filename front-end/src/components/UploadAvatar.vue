<script setup lang="ts">
import { ref } from 'vue';

export interface Props {
	image?: string;
	login?: boolean;
}

withDefaults(defineProps<Props>(), {
	image: '',
	login: false,
});

const imageData = ref('');
const inputEvent = ref<HTMLInputElement | null>(null);

const emit = defineEmits<{
	(event: 'imageLoaded', imageData: string): void;
}>();

const createBase64Image = (event: Event) => {
	const selectedFile = event.target as HTMLInputElement;
	const fileName = (selectedFile.files as FileList)[0] as File;
	const reader = new FileReader();

	reader.onload = function () {
		imageData.value = reader.result as string;
		emit('imageLoaded', imageData.value);
	};
	reader.readAsDataURL(fileName);
};

const changeAvatar = () => {
	inputEvent.value?.click();
};
</script>

<template>
	<div v-if="login" class="shrink-0">
		<img @click="changeAvatar" class="w-20 h-20 rounded-full object-cover border-2 sm:w-36 sm:h-36" :src="image" alt="Rounded avatar" />
		<input style="display: none" ref="inputEvent" @change="createBase64Image" type="file" name="upload" accept="image/*" />
	</div>
	<div v-else>
		<input
			class="block w-full text-xs cursor-pointer rounded-md focus:outline-none text-red-200 file:rounded-md file:py-1.5 file:text-xs file:bg-red-600 file:border-0 file:text-red-200"
			@change="createBase64Image"
			type="file"
			name="upload"
			accept="image/*"
		/>
	</div>
</template>
