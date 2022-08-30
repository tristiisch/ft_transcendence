<script setup lang="ts">
import AddSearchPlayer from '@/components/Chat/AddSearchPlayer.vue';
import ButtonCloseValidate from '@/components/Chat/ButtonCloseValidate.vue'
import PartToDisplay from '@/types/ChatPartToDisplay';
import { useChatStore } from '@/stores/chatStore';

const chatStore = useChatStore();
const emit = defineEmits<{ (e: 'close'): void }>()

</script>

<template>
    <div class="flex flex-col justify-between items-center h-full w-full px-6 3xl:px-10">
        <AddSearchPlayer :singleSelection="true" :type="'channels'"></AddSearchPlayer>
        <button-close-validate @validate="chatStore.joinNewChannel()" @close="emit('close')"></button-close-validate>
    </div>
</template>