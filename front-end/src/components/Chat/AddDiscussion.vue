<script setup lang="ts">
import AddSearchPlayer from '@/components/Chat/AddSearchPlayer.vue';
import ButtonCloseValidate from '@/components/Chat/ButtonCloseValidate.vue'
import PartToDisplay from '@/types/ChatPartToDisplay';
import { useChatStore } from '@/stores/chatStore';

const chatStore = useChatStore();

function onValidate() {
    if (chatStore.isTypeUser(chatStore.selectedItems[0]))
        chatStore.addNewDiscussion(chatStore.selectedItems[0])
}
</script>

<template>
    <div class="flex flex-col justify-between items-center h-full w-full px-6 3xl:px-10">
        <AddSearchPlayer :singleSelection="true" :type="'users'"></AddSearchPlayer>
        <button-close-validate @validate="onValidate()" @close="chatStore.setRightPartToDisplay(PartToDisplay.CHAT)"></button-close-validate>
    </div>
</template>