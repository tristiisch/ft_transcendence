<script setup lang="ts">
import { ref, onBeforeMount} from 'vue'
import { useUserStore } from '@/stores/userStore'
import UploadAvatar from '@/components/UploadAvatar.vue';
import ButtonGradient1 from '@/components/ButtonGradient1.vue';
import AddSearchPlayer from '@/components/Chat/AddSearchPlayer.vue';
import ButtonCloseValidate from '@/components/Chat/ButtonCloseValidate.vue'

const userStore = useUserStore();
const selectPlayer = ref(false);
const protectedChannel = ref(false);

const image = ref(userStore.userData.avatar);
let isUpload = false;

function uploadImage(imageData: string): void {
	image.value = imageData;
	isUpload = true;
}

function invitePlayer(){

	selectPlayer.value = !selectPlayer.value
}

const emit = defineEmits<{
	(e: 'close'): void,
	(e: 'validate'): void
}>()

</script>


<template>
	<div v-if="!selectPlayer" class="flex flex-col justify-between items-center h-full w-full px-6 3xl:px-10">
		<div class="flex flex-col justify-center items-center gap-6 h-full w-full">
			<div class="mb-2 w-full lg:w-4/5">
				<label class="block mb-2 text-sm font-medium text-red-200">Channel name:</label>
				<input type="text" class="bg-neutral-100 border border-blue-600 placeholder:text-slate-300 placeholder:text-center text-center text-blue-600 text-sm rounded-lg focus:ring-blue-500 focus:border-red-600 block w-full p-2" placeholder="choose name">
			</div>
			<div class="inline-flex shadow-sm w-full lg:w-4/5">
				<button @click="protectedChannel = false" class="w-1/3 py-2 px-4 text-xs text-blue-600 bg-neutral-100 rounded-l-lg border border-blue-600 sm:text-sm focus:bg-blue-600 focus:text-white">
					Public
				</button>
				<button @click="protectedChannel = false" class="w-1/3 py-2 px-4 text-xs text-blue-600 bg-neutral-100 border-t border-b border-blue-600 sm:text-sm focus:bg-blue-600 focus:text-white">
					Private
				</button>
				<button @click="protectedChannel = true" class="w-1/3 py-2 px-4 text-xs text-blue-600 bg-neutral-100 rounded-r-md border border-blue-600 sm:text-sm focus:bg-blue-600 focus:text-white">
					Protected
				</button>
			</div>
			<!-- <div v-if="success">
				<label class="block mb-2 text-sm font-medium text-green-700 dark:text-green-500">Channel name:</label>
				<input type="text" id="success" class="bg-green-50 border border-green-500 text-green-900 dark:text-green-400 placeholder-green-700 dark:placeholder-green-500 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-green-500" placeholder="Success input">
				<p class="mt-2 text-sm text-green-600 dark:text-green-500"><span class="font-medium">Well done!</span> Some success messsage.</p>
			</div>
			<div v-else>
				<label for="error" class="block mb-2 text-sm font-medium text-red-700 dark:text-red-500">Channel name:</label>
				<input type="text" id="error" class="bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500" placeholder="Error input">
				<p class="mt-2 text-sm text-red-600 dark:text-red-500"><span class="font-medium">Oh, snapp!</span> Some error message.</p>
			</div> -->
			<div v-if="protectedChannel" class="w-full lg:w-4/5">
				<label class="block mb-2 text-sm font-medium text-red-200">Password:</label>
				<input type="text" class="bg-neutral-100 border border-blue-600 placeholder:text-slate-300 text-sm rounded-lg focus:ring-blue-500 focus:border-red-600 block w-full p-2" placeholder="choose password">
			</div>
			<div class="flex flex-col justify-center items-center w-full sm:w-4/5">
				<label class="block mb-2 text-sm font-medium text-red-200">Choose image:</label>
				<div class="flex items-end gap-5 shrink-0">
					<img class="w-10 h-10 sm:w-20 sm:h-20 rounded object-cover border-[1px] border-zinc-300" src="@/assets/obama.jpeg" alt="Rounded avatar">
					<upload-avatar @image-loaded="uploadImage"></upload-avatar>
				</div>
			</div>
		</div>
		<button-close-validate @click="selectPlayer = !selectPlayer" @close="emit('close')"></button-close-validate>
	</div>
	<add-search-player v-if="selectPlayer"  @close="emit('close')" @validate="emit('validate')" :singleSelection="false"></add-search-player>
	
</template>