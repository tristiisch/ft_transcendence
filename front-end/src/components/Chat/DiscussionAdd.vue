<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import { useGlobalStore } from '@/stores/globalStore';
import PartToDisplay from '@/types/ChatPartToDisplay';
import type Message from '@/types/Message';
import type Discussion from '@/types/Discussion';
import ChatStatus from '@/types/ChatStatus';
import UsersSearch from '@/components/Divers/UsersChannelsSearch.vue';
import ButtonCloseValidate from '@/components/Button/ButtonCloseValidate.vue';

const chatStore = useChatStore();
const globalStore = useGlobalStore();


function createNewDiscussion()
{
    if (globalStore.isTypeUser(globalStore.selectedItems[0])) {
        const newDiscussion: Discussion = { type: ChatStatus.DISCUSSION, user: globalStore.selectedItems[0], messages: [] as Message[] };
        chatStore.createNewDiscussion(newDiscussion, true);
        globalStore.resetSelectedItems();
    }
}
</script>

<template>
    <div class="flex flex-col justify-between items-center h-full w-full px-6 3xl:px-10">
        <users-search :singleSelection="true" :type="'users'"></users-search>
        <button-close-validate @validate="createNewDiscussion()" @close="chatStore.setRightPartToDisplay(PartToDisplay.CHAT)"></button-close-validate>
    </div>
</template>