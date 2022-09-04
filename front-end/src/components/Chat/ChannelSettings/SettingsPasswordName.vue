<script setup lang="ts">
import { ref, computed, onBeforeMount} from 'vue'
import { useChatStore } from '@/stores/chatStore';
import status from '@/types/ChatStatus';
import ButtonCloseValidate from '@/components/Button/ButtonCloseValidate.vue';

const chatStore = useChatStore();
const newPassword = ref('');
const newChannelName = ref('');

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
	
function updatePasswordName() {
    if (chatStore.inChannel) {
        if (newChannelName.value != '' && newChannelName.value !== chatStore.inChannel.name)
            chatStore.UpdateChannelName(chatStore.inChannel, newChannelName.value);
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
        <div class="flex flex-col justify-center items-center gap-6 h-full">
            <div class="w-full sm:w-3/4">
                <label class="block mb-2 text-sm font-medium text-red-200">Change channel name:</label>
                <input type="text" v-model.trim="newChannelName" class="bg-neutral-100 text-blue-600 text-center border border-blue-600 placeholder:text-slate-300 text-sm rounded-lg focus:ring-blue-500 focus:border-red-600 block w-full p-2">
            </div>
            <div class="w-full sm:w-3/4">
                <label class="block mb-2 text-sm font-medium text-red-200">{{ label }}</label>
                <input type="text" v-model.trim="newPassword" class="bg-neutral-100 border border-blue-600 placeholder:text-slate-300 placeholder:text-center text-sm rounded-lg focus:ring-blue-500 focus:border-red-600 block w-full p-2" placeholder="choose password">
            </div>
            <div v-if="chatStore.isProtectedChannel" class="w-full sm:w-3/4">
                 <label class="block mb-2 text-sm font-medium text-red-200">Remove password:</label>
                 <base-button class=" self-center mr-6 bg-blue-600 py-2 px-5 text-white">Remove</base-button>
            </div>
        </div>
    </div>
    <button-close-validate @validate="updatePasswordName()" @close="emit('close')"></button-close-validate>
</template>