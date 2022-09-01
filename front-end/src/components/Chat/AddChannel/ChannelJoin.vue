<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import ChannelsSearch from '@/components/Divers/UsersChannelsSearch.vue';
import ButtonCloseValidate from '@/components/Button/ButtonCloseValidate.vue'

const chatStore = useChatStore();
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
    <channels-search :singleSelection="true" :type="'channels'"></channels-search>
    <button-close-validate @validate="chatStore.joinNewChannel()" @close="emit('close')"></button-close-validate>
</template>