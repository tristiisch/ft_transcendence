<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import { useGlobalStore } from '@/stores/globalStore';
import ChatStatus from '@/types/ChatStatus';
import PartToDisplay from '@/types/ChatPartToDisplay';
import ChannelsSearch from '@/components/Divers/UsersChannelsSearch.vue';
import ButtonCloseValidate from '@/components/Button/ButtonCloseValidate.vue'

const chatStore = useChatStore();
const globalStore = useGlobalStore();
const emit = defineEmits<{ (e: 'close'): void }>()

function joinNewChannel() {
    if (!globalStore.isTypeUser(globalStore.selectedItems[0])) {
        const newChannel = globalStore.selectedItems[0];
		if (newChannel.type === ChatStatus.PROTECTED) {
			chatStore.setRightPartToDisplay(PartToDisplay.PASSWORD_QUERY);
		}
		else {
        	chatStore.joinNewChannel(newChannel)
        	globalStore.resetSelectedItems();
		}
    }
}
</script>

<template>
    <channels-search :singleSelection="true" :type="'channels'"></channels-search>
    <button-close-validate @validate="joinNewChannel()" @close="emit('close')"></button-close-validate>
</template>