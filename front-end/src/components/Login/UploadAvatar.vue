<script setup lang="ts">
import { ref } from 'vue';

const imageData = ref('');
const inputEvent = ref<HTMLInputElement | null>(null);

const emit = defineEmits<{
	(e: 'imageLoaded', value: string): void;
}>();

const props = defineProps<{
	image: string;
}>();

const onEventUploadAvatar = (event: Event) => {
	const selectedFile = event.target as HTMLInputElement;
	const fileName = (selectedFile.files as FileList)[0] as File;
	console.log(fileName);
	const fileReader = new FileReader();
	fileReader.addEventListener('load', (event) => {
		imageData.value = event.target?.result as string;
		console.log('setimageUrl', imageData.value);
		emit('imageLoaded', imageData.value);
	});
	fileReader.readAsDataURL(fileName);
};

const changeAvatar = () => {
	console.log('sendEvent preview');
	inputEvent.value?.click();
};
</script>

<template>
	<img @click="changeAvatar" class="w-20 h-20 rounded-full object-cover border-2 sm:w-28 sm:h-28 md:w-36 md:h-36" :src="image" alt="Rounded avatar" />
	<input style="display: none" ref="inputEvent" @change="onEventUploadAvatar" type="file" name="upload" accept="image/*" />
</template>
