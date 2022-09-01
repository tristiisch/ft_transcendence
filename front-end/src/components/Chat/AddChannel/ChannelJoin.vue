<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import ChannelsSearch from '@/components/Chat/UsersChannelsSearch.vue';
import ButtonCloseValidate from '@/components/Chat/Button/ButtonCloseValidate.vue'

const chatStore = useChatStore();
const emit = defineEmits<{ (e: 'close'): void }>()

</script>

<template>
    <div class="flex flex-col justify-between items-center h-full w-full px-6 3xl:px-10">
        <channels-search :singleSelection="true" :type="'channels'"></channels-search>
        <button-close-validate @validate="chatStore.joinNewChannel()" @close="emit('close')"></button-close-validate>
    </div>
</template>