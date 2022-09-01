<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import PartToDisplay from '@/types/ChatPartToDisplay';
import UsersSearch from '@/components/Chat/UsersChannelsSearch.vue';
import ButtonCloseValidate from '@/components/Chat/Button/ButtonCloseValidate.vue'

const chatStore = useChatStore();

function onValidate() {
    if (chatStore.isTypeUser(chatStore.selectedItems[0]))
        chatStore.addNewDiscussion(chatStore.selectedItems[0])
}
</script>

<template>
    <div class="flex flex-col justify-between items-center h-full w-full px-6 3xl:px-10">
        <users-search :singleSelection="true" :type="'users'"></users-search>
        <button-close-validate @validate="onValidate()" @close="chatStore.setRightPartToDisplay(PartToDisplay.CHAT)"></button-close-validate>
    </div>
</template>