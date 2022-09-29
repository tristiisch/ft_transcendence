<script setup lang="ts">
import { useToast } from 'vue-toastification';
import { useUserStore } from '@/stores/userStore';
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import UploadAvatar from '@/components/Divers/UploadAvatar.vue';

const userStore = useUserStore();
const toast = useToast();
const router = useRouter();
const route = useRoute();
const newUsername = ref(userStore.userData.username);
const newAvatar = ref(userStore.userData.avatar);

function uploadImage(imageData: string): void {
	newAvatar.value = imageData;
}

function submitProfileForm() {
	if (userStore.userData.avatar !== newAvatar.value)
	{
		userStore
		.updateAvatar(newAvatar.value)
		.catch((error) => {
			if (error.response?.status === 413) toast.warning('The avatar is too big. The maximum is 10mb.');
			else if (error.response?.status === 412) toast.warning('Unknown format for avatar');
			else router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
		});
	}
	if (userStore.userData.username !== newUsername.value)
	{
		userStore
		.updateUsername(newUsername.value)
		.then(() => {
			router.push({ name: 'Profile', params: { username: userStore.userData.username } });
		})
		.catch((error) => {
			//check for name already exist in database --> Code === 403 ?
			if (error.response?.status === 403) toast.error(error.response?.data?.message)
			else if (error.response?.status === 400) toast.warning('Username is not correct : ' + (error.response?.data?.message as string[]).join(', '));
			else if (error.response?.status === 412) toast.warning(error.response?.data?.message);
			else router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status, message: error.response?.data?.message }});
		});
	}
}

function cancelProfileForm() {
	newUsername.value = userStore.userData.username;
	newAvatar.value = userStore.userData.avatar;
}

watch(
	() => userStore.userData.avatar,
	() => {
		newAvatar.value = userStore.userData.avatar;
	}
);

</script>

<template>
	<form class="flex flex-col justify-center items-center h-full w-full gap-4 sm:gap-8" @submit.prevent>
		<div class="flex flex-col justify-center items-center w-full">
			<label class="block mb-2 text-sm text-center text-red-200">Change username</label>
			<input
				class="placeholder-slate-300 bg-neutral-100 border border-blue-600 rounded-lg text-center w-[184px] text-xs py-1 sm:py-2 text-blue-600"
				type="text"
				v-model.trim="newUsername"
				placeholder="Username"
			/>
		</div>
		<div class="flex flex-col justify-center w-full">
			<label class="block mb-2 text-sm text-center text-red-200">Change avatar</label>
			<div class="flex justify-center gap-6">
				<img class="shrink-0 w-12 h-12 sm:w-20 sm:h-20 rounded-lg object-cover border border-blue-600" :src="newAvatar" alt="Rounded avatar" />
				<upload-avatar @image-loaded="uploadImage"></upload-avatar>
			</div>
		</div>
		<div class="flex gap-6">
			<base-button @click="submitProfileForm" class="text-sm w-20 py-1 sm:py-2 mt-5 rounded-lg bg-neutral-100 text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-neutral-100">Save</base-button>
			<base-button @click="cancelProfileForm" class="text-sm w-20 py-1 sm:py-2 mt-5 rounded-lg bg-neutral-100 text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-neutral-100">Cancel</base-button>
		</div>
	</form>
</template>
