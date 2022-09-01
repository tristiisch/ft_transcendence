<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import PartToDisplay from '@/types/ChatPartToDisplay';
import UsersSearch from '@/components/Divers/UsersChannelsSearch.vue';
import ButtonCloseValidate from '@/components/Button/ButtonCloseValidate.vue';

const chatStore = useChatStore();
</script>

<template>
    <div class="flex flex-col justify-between items-center h-full w-full px-6 3xl:px-10">
        <users-search :singleSelection="true" :type="'users'"></users-search>
        <button-close-validate @validate="chatStore.addNewDiscussion()" @close="chatStore.setRightPartToDisplay(PartToDisplay.CHAT)"></button-close-validate>
    </div>
</template>