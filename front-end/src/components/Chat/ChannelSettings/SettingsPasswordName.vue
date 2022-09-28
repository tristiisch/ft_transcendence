<script setup lang="ts">
import { ref, computed, onBeforeMount} from 'vue'
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';
import status, { ChatStatus } from '@/types/ChatStatus';
import ButtonCloseValidate from '@/components/Button/ButtonCloseValidate.vue';
import Toogle from '@/components/Divers/ToogleButton.vue';

const chatStore = useChatStore();
const userStore = useUserStore();
const newPassword = ref('');
const deletePassword = ref(false);
const newChannelName = ref('');
const switchButtonActif = ref(false);

const emit = defineEmits<{
	(e: 'close'): void,
}>()

const label = computed(() => {
    if (chatStore.inChannel)
    {
        if (chatStore.inChannel.type === status.PROTECTED)
		    return 'Choose new password'
	    else
		    return 'you can set a password'
    }
});

function setRemovePassword() {
	if (switchButtonActif.value) !switchButtonActif.value;
		deletePassword.value = true;
	if (!switchButtonActif.value)
		deletePassword.value = false;
	newPassword.value = '';
}

function updatePasswordName() {
    if (chatStore.inChannel) {
        chatStore.updateChannelNamePassword(chatStore.inChannel, { name: newChannelName.value, password: newPassword.value ? newPassword.value : (deletePassword.value ? null : undefined),
			removePassword: switchButtonActif.value, userWhoChangeName: userStore.userData });	
    }
    emit('close')
}

onBeforeMount(() => {
    if (chatStore.inChannel)
        newChannelName.value = chatStore.inChannel.name
})
</script>

<template>
    <div class="flex flex-col justify-between h-full">
        <div class="flex flex-col justify-center items-center gap-1 sm:gap-4 h-full">
            <div class="w-full sm:w-3/4">
                <label class="block mb-1 sm:mb-2 text-sm font-medium text-red-200">Change channel name:</label>
                <input type="text" v-model.trim="newChannelName" class="bg-neutral-100 text-blue-600 text-center border border-blue-600 placeholder:text-slate-300 text-sm rounded-lg focus:ring-blue-500 focus:border-red-600 block w-full p-2">
            </div>
            <div v-if="!switchButtonActif" class="w-full sm:w-3/4">
                <label class="block mb-1 sm:mb-2 text-sm font-medium text-red-200">{{ label }}</label>
                <input type="text" v-model.trim="newPassword" class="bg-neutral-100 border border-blue-600 placeholder:text-slate-300 placeholder:text-center text-sm rounded-lg focus:ring-blue-500 focus:border-red-600 block w-full p-2" placeholder="choose password">
            </div>
            <div v-if="chatStore.inChannel?.type === ChatStatus.PROTECTED" class="flex flex-col justify-center w-full sm:w-3/4">
                 <label class="self-start block mb-1 sm:mb-2 text-sm font-medium text-red-200">Remove password:</label>
                 <toogle :chat="true" @switchButton="setRemovePassword()" class="self-center"></toogle>
            </div>
        </div>
    </div>
    <button-close-validate @validate="updatePasswordName()" @close="emit('close')"></button-close-validate>
</template>