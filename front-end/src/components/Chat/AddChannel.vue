<script setup lang="ts">
import { ref, onBeforeMount} from 'vue'
import { useUserStore } from '@/stores/userStore'
import UploadAvatar from '@/components/UploadAvatar.vue';
import ButtonGradient1 from '@/components/ButtonGradient1.vue';
import AddSearchPlayer from '@/components/Chat/AddSearchPlayer.vue';
import UserService from '@/services/UserService';
import ButtonCloseValidate from '@/components/Chat/ButtonCloseValidate.vue'
import type User from '@/types/User';
import type Channel from '@/types/Channel';
import channelStatus from '@/types/ChannelStatus'

const userStore = useUserStore();
const selectPlayer = ref(false);
const protectedChannel = ref(false);
const newChannelType = ref<channelStatus>(channelStatus.PUBLIC);
const newChannelName = ref('');
const newPassword = ref<string | null>(null);
const newAvatar = ref('src/assets/ChannelDefaultPublic.png');

let isUpload = false;

function uploadImage(imageData: string): void {
	newAvatar.value = imageData;
	isUpload = true;
}

function treatNewChannelData(users: User[])
{
	users.push(userStore.userData)
	const usersId: number[] = []
	for(const user of users)
		usersId.push(user.id)
	const newChannel: Channel = {
		name: newChannelName.value,
		type: newChannelType.value,
		avatar: newAvatar.value,
		users: users,
		password: newPassword.value,
		admin: [userStore.userData],
		owner: userStore.userData.username,
		mute: [],
		banned: [],
		messages: []
	}
	emit('validateAddChannel', usersId, newChannel)
}

function clickOnButtonPublic()
{
	protectedChannel.value = false
	newChannelType.value=channelStatus.PUBLIC
	newAvatar.value = 'src/assets/ChannelDefaultPublic.png'
}

function clickOnButtonPrivate()
{
	protectedChannel.value = false
	newChannelType.value=channelStatus.PRIVATE
	newAvatar.value = 'src/assets/ChannelDefaultPrivate.png'
}

function clickOnButtonProtected()
{
	protectedChannel.value = false
	newChannelType.value=channelStatus.PROTECTED
	newAvatar.value = 'src/assets/ChannelDefaultProtected.png'
}

const emit = defineEmits<{
	(e: 'close'): void,
	(e: 'validateAddChannel', usersId: number[], newChannel: Channel): void
}>()

</script>


<template>
	<div v-if="!selectPlayer" class="flex flex-col justify-between items-center h-full w-full px-6 3xl:px-10">
		<div class="flex flex-col justify-center items-center gap-6 h-full w-full">
			<form class="mb-2 w-full lg:w-4/5" @submit.prevent>
				<label class="block mb-2 text-sm font-medium text-red-200">Channel name:</label>
				<input type="text" v-model="newChannelName" class="bg-neutral-100 border border-blue-600 placeholder:text-slate-300 placeholder:text-center text-center text-blue-600 text-sm rounded-lg focus:ring-blue-500 focus:border-red-600 block w-full p-2" placeholder="choose name">
			</form>
			<div class="inline-flex shadow-sm w-full lg:w-4/5">
				<button @click="clickOnButtonPublic" class="w-1/3 py-2 px-4 text-xs text-blue-600 bg-neutral-100 rounded-l-lg border border-blue-600 sm:text-sm focus:bg-blue-600 focus:text-white">
					Public
				</button>
				<button @click="clickOnButtonPrivate" class="w-1/3 py-2 px-4 text-xs text-blue-600 bg-neutral-100 border-t border-b border-blue-600 sm:text-sm focus:bg-blue-600 focus:text-white">
					Private
				</button>
				<button @click="clickOnButtonProtected" class="w-1/3 py-2 px-4 text-xs text-blue-600 bg-neutral-100 rounded-r-md border border-blue-600 sm:text-sm focus:bg-blue-600 focus:text-white">
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
			<form v-if="protectedChannel" class="w-full lg:w-4/5" @submit.prevent>
				<label class="block mb-2 text-sm font-medium text-red-200">Password:</label>
				<input type="text" v-model="newPassword" class="bg-neutral-100 border border-blue-600 placeholder:text-slate-300 text-sm rounded-lg focus:ring-blue-500 focus:border-red-600 block w-full p-2" placeholder="choose password">
			</form>
			<div class="flex flex-col justify-center items-center w-full sm:w-4/5">
				<label class="block mb-2 text-sm font-medium text-red-200">Choose image:</label>
				<div class="flex items-end gap-5 shrink-0">
					<img class="w-10 h-10 sm:w-20 sm:h-20 rounded object-cover border-[1px] border-zinc-300" :src="newAvatar" alt="Rounded avatar">
					<upload-avatar @image-loaded="uploadImage"></upload-avatar>
				</div>
			</div>
		</div>
		<button-close-validate @click="selectPlayer = !selectPlayer" @close="emit('close')"></button-close-validate>
	</div>
	<add-search-player v-if="selectPlayer"  @close="emit('close')" @validateAddChannel="treatNewChannelData" :singleSelection="false"></add-search-player>
	
</template>