<script setup lang="ts">
import QRCode from '@/components/Profile/QRCode.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import UploadAvatar from '@/components/UploadAvatar.vue';

const userStore = useUserStore();
const router = useRouter();
const newUsername = ref(userStore.userData.username);
const image = ref(userStore.userData.avatar);
const mode = ref('2FA');
let isUpload = false;

function uploadImage(imageData: string): void {
	image.value = imageData;
	isUpload = true;
}

function submitProfileForm() {
	if (newUsername.value !== userStore.userData.username) userStore.updateUsername(newUsername.value);
	if (isUpload) userStore.updateAvatar(image.value);
	router.push({ name: 'Profile', params: { username: userStore.userData.username } });
}
</script>

<template>
	<div class="flex flex-col items-center h-full w-full px-6 sm:px-8">
		<div class="inline-flex shadow-sm w-full">
			<button
				@click="mode = '2FA'"
				class="w-1/3 py-2 px-4 text-xs font-medium text-gray-800 bg-red-200 rounded-l-lg border border-red-100 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white"
			>
				2FA
			</button>
			<button
				@click="mode = 'Edit'"
				class="w-1/3 py-2 px-4 text-xs font-medium text-gray-800 bg-red-200 border-t border-b border-red-100 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white"
			>
				Edit
			</button>
			<button
				@click="mode = 'Remove'"
				class="w-1/3 py-2 px-4 text-xs font-medium text-gray-800 bg-red-200 rounded-r-md border border-red-100 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white"
			>
				Account
			</button>
		</div>
		<div v-if="mode === '2FA'" class="flex flex-col justify-center items-center gap-8 h-full w-full">
			<q-r-code></q-r-code>
		</div>
		<div v-else-if="mode === 'Edit'" class="flex flex-col items-center justify-between h-full w-full">
			<div class="flex flex-col justify-center h-full w-full sm:w-fit gap-4 sm:gap-8">
				<div>
					<label class="block mb-2 text-sm font-medium text-red-200">Change Username:</label>
					<div class="flex items-center w-full gap-2">
						<form class="w-full">
							<input
								class="placeholder-red-200 bg-red-400 w-full rounded-md text-center font-medium text-xs py-1.5 text-red-600"
								type="text"
								name="username"
								v-model.trim="newUsername"
								placeholder="username"
							/>
						</form>
					</div>
				</div>
				<div class="flex flex-col items-center w-full sm:flex-row sm:gap-4">
					<img class="self-end -mb-4 sm:mb-0 shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded object-cover border-[1px] border-zinc-300" src="@/assets/obama.jpeg" alt="Rounded avatar">
					<div class="flex flex-col">
						<label class="block mb-2 text-sm font-medium text-red-200">Change avatar:</label>
						<upload-avatar @image-loaded="uploadImage"></upload-avatar>
					</div>
				</div>
			</div>
			<base-button @click="submitProfileForm" class="self-end bg-blue-600 py-1 px-5 text-white">Save</base-button>
		</div>
		<div v-else-if="mode === 'Remove'" class="flex flex-col items-center justify-center gap-8 h-full w-full">
			<p class="text-center text-red-200 text-xs sm:text-sm">You can delete your account below. Profile deletion is irreversible and you will lost all your data.</p>
			<base-button class="bg-blue-600 py-1 px-5 text-white">Delete</base-button>
		</div>
	</div>
</template>
