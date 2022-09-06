<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';
import { ref, onBeforeMount } from 'vue';
import { useGlobalStore } from '@/stores/globalStore';
import type User from '@/types/User';
import ButtonCloseValidate from '@/components/Button/ButtonCloseValidate.vue'
import UsersSearch from '@/components/Divers/UsersChannelsSearch.vue';

const chatStore = useChatStore();
const userStore = useUserStore();
const globalStore = useGlobalStore();
const selectableUsers = ref<User[]>(globalStore.users.filter(user => user.id !== userStore.userData.id))

const emit = defineEmits<{ 
    (e: 'close'): void
}>()

function invitePlayer() {

}

</script>

<template>
    <users-search :selectableItems="selectableUsers" :singleSelection="false" :type="'users'"></users-search>
    <button-close-validate @validate="invitePlayer()" @close="emit('close')"></button-close-validate>
</template>