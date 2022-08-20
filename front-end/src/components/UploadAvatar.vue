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
		<img @click="changeAvatar" class="w-20 h-20 rounded-full object-cover border-2 sm:w-36 sm:h-36 cursor-pointer" :src="image" alt="Rounded avatar" />
		<input style="display: none" ref="inputEvent" @change="createBase64Image" type="file" name="upload" accept="image/*" />
	</div>
	<div v-else>
		<div  @click="changeAvatar" class="flex items-center justify-center w-10 h-10 sm:w-20 sm:h-20 bg-neutral-100 text-blue-600 rounded-lg shadow-lg border border-blue-600 cursor-pointer hover:bg-blue-600 hover:text-neutral-100">
			<svg class="w-6 h-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
				<path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
			</svg>
			<input
				style="display: none"
				ref="inputEvent"
				@change="createBase64Image"
				type="file"
				name="upload"
				accept="image/*"
			/>
		</div>
	</div>
</template>


