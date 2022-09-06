<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import { useGlobalStore } from '@/stores/globalStore';
import ButtonCloseValidate from '@/components/Button/ButtonCloseValidate.vue'
import UsersSearch from '@/components/Divers/UsersChannelsSearch.vue';

const chatStore = useChatStore();
const globalStore = useGlobalStore();

const emit = defineEmits<{ 
    (e: 'close'): void
}>()

function invitePlayer() {
    if (chatStore.inChannel && globalStore.isTypeArrayUsers(globalStore.selectedItems))
        chatStore.inviteUserToPrivateChannel(chatStore.inChannel, globalStore.selectedItems);
    globalStore.resetSelectedItems();
    emit('close')
}
</script>

<template>
    <users-search :singleSelection="false" :type="'usersNotInChannel'"></users-search>
    <button-close-validate @validate="invitePlayer()" @close="emit('close')"></button-close-validate>
</template>