<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';
import { useGlobalStore } from '@/stores/globalStore';
import { useToast } from 'vue-toastification';
import { ref, watch } from 'vue';
import type Channel from '@/types/Channel';
import { ChatStatus } from '@/types/ChatStatus';
import UploadAvatar from '@/components/Divers/UploadAvatar.vue';
import UsersSearch from '@/components/Divers/UsersChannelsSearch.vue';
import ButtonCloseValidate from '@/components/Button/ButtonCloseValidate.vue';
import ChanneldefaultAvatarPublic from '@/assets/ChannelDefaultPublic.png';
import ChannelDefaultPrivate from '@/assets/ChannelDefaultPrivate.png';
import ChannelDefaultProtected from '@/assets/ChannelDefaultProtected.png';

const chatStore = useChatStore();
const globalStore = useGlobalStore();
const toast = useToast();
const userStore = useUserStore();
const newChannelType = ref<ChatStatus>(ChatStatus.PUBLIC);
const newChannelName = ref('');
const newPassword = ref('');
const newAvatar = ref(ChanneldefaultAvatarPublic);
const selectPlayer = ref(false);
const error = ref('');
let isUpload = false;
const avatarTooBig = ref(false)

const emit = defineEmits<{
	(e: 'close'): void,
}>()

function uploadImage(imageData: string, fileSize: number): void {
	newAvatar.value = imageData;
	isUpload = true;
	if (fileSize > 1)
		avatarTooBig.value = true;
}

function clickOnButtonPublic() {
	newChannelType.value = ChatStatus.PUBLIC
    if (!isUpload)
	    newAvatar.value = ChanneldefaultAvatarPublic;
}

function clickOnButtonPrivate() {
	newChannelType.value = ChatStatus.PRIVATE
    if (!isUpload)
	    newAvatar.value = ChannelDefaultPrivate;
}

function clickOnButtonProtected() {
	newChannelType.value = ChatStatus.PROTECTED
    if (!isUpload)
	    newAvatar.value = ChannelDefaultProtected;
}

function treatNewChannelData()
{
	if (!avatarTooBig.value) {
		if (globalStore.isTypeArrayUsers(globalStore.selectedItems)) {
			const selection = globalStore.selectedItems;
			const newChannel: Channel = {
				name: newChannelName.value,
				owner: null,
				avatar: newAvatar.value,
				hasPassword: newPassword.value !== '' ? true : false,
				users: selection,
				admins: [],
				muted: [],
				banned: [],
				type: newChannelType.value, 
				messages: [],
			}
			if (!globalStore.isTypeUser(newChannel)) {
				chatStore.createNewChannel(newChannel, selection, newPassword.value)
				globalStore.resetSelectedItems();
			}
		}
	}
	else {
		toast.warning('Selected file too big.');
		avatarTooBig.value = false;
	}
}

function onValidation() {
    if (newChannelName.value === '') {
        error.value = 'name empty';
        return
    }
    if (newChannelType.value === ChatStatus.PROTECTED && newPassword.value === '')  {
        error.value = 'password empty';
        return
    }
    if (selectPlayer.value)
        treatNewChannelData()
    else
        selectPlayer.value = !selectPlayer.value
}

function labelInputChannelName() {
    if (error.value === 'name empty')
        return 'Please enter a Channel Name'
    else
        return 'Channel name:'
}

function labelInputPassword() {
    if (error.value === 'password empty')
        return 'Please enter a Password Name'
    else
        return 'Password:'
}

function onClose() {
	if (selectPlayer.value === true)
		selectPlayer.value = false;
	else 
		emit('close');
	if (globalStore.selectedItems.length)	
		globalStore.resetSelectedItems();
}

watch(() => newChannelName.value, () => {
    if (newChannelName.value !== '')
        error.value = '';
});

watch(() => newPassword.value, () => {
    if (newPassword.value !== '')
        error.value = '';
});
</script>

<template>
    <div v-if="!selectPlayer" class="flex flex-col justify-center items-center gap-2 sm:gap-6 h-full w-full">
        <form class="mb-2 w-full lg:w-4/5" @submit.prevent>
            <label class="block mb-1 sm:mb-2 text-sm font-medium" :class="error === 'name empty' ? 'text-red-700' : 'text-red-200'">{{ labelInputChannelName() }}</label>
            <input type="text" v-model="newChannelName" :class="error === 'name empty' ? 'border-red-800' : 'border-blue-600'" class="bg-neutral-100 border placeholder:text-slate-300 placeholder:text-center text-center text-blue-600 text-sm rounded-lg block w-full p-2" placeholder="choose name">
        </form>
        <div class="inline-flex shadow-sm w-full lg:w-4/5">
            <button @click="clickOnButtonPublic" class="w-1/3 py-2 px-4 text-xs sm:text-sm border border-r-none rounded-l-lg border-blue-600" :class="newChannelType === ChatStatus.PUBLIC ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-blue-600'">
                Public
            </button>
            <button @click="clickOnButtonPrivate" class="w-1/3 py-2 px-4 text-xs sm:text-sm border-t border-b border-blue-600" :class="newChannelType === ChatStatus.PRIVATE ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-blue-600'">
                Private
            </button>
            <button @click="clickOnButtonProtected" class="w-1/3 py-2 px-4 text-xs sm:text-sm border rounded-r-md border-blue-600" :class="newChannelType === ChatStatus.PROTECTED ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-blue-600'">
                Protected
            </button>
        </div>
        <form v-if="newChannelType === ChatStatus.PROTECTED" class="w-full lg:w-4/5" @submit.prevent>
            <label class="block mb-1 sm:mb-2 text-sm font-medium" :class="error === 'password empty'? 'text-red-700' : 'text-red-200'">{{ labelInputPassword() }}</label>
            <input type="text" v-model="newPassword" :class="error === 'password empty' ? 'border-red-800' : 'border-blue-600'" class="bg-neutral-100 border placeholder:text-slate-300 text-blue-600 text-sm rounded-lg w-full p-2" placeholder="choose password">
        </form>
        <div class="flex flex-col justify-center items-center w-full sm:w-4/5">
            <label class="block mb-2 text-sm font-medium text-red-200">Choose image:</label>
            <div class="flex items-center gap-5 shrink-0">
                <img class="w-10 h-10 sm:w-20 sm:h-20 rounded object-cover border-[1px] border-zinc-300" :src="newAvatar" alt="Rounded avatar">
                <upload-avatar @image-loaded="uploadImage"></upload-avatar>
            </div>
        </div>
    </div>
    <users-search v-else :singleSelection="false" :type="'users'"></users-search>
    <button-close-validate @validate="onValidation()" @close="onClose()"></button-close-validate>
</template>