<script setup lang="ts">
import { ref } from 'vue';

const imageData = ref('');
const inputEvent = ref<HTMLInputElement | null>(null);

const emit = defineEmits<{
	(event: 'imageLoaded', imageData: string): void;
}>();

defineProps<{
	image: string;
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
	<img @click="changeAvatar" class="w-20 h-20 rounded-full object-cover border-2 sm:w-28 sm:h-28 md:w-36 md:h-36" :src="image" alt="Rounded avatar" />
	<input style="display: none" ref="inputEvent" @change="createBase64Image" type="file" name="upload" accept="image/*" />
</template>
