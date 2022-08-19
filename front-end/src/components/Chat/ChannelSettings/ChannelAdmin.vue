<script setup lang="ts">
import type Channel from '@/types/Channel';
import type User from '@/types/User';
import PlayerDisplayList from '@/components/Chat/PlayerDisplayList.vue'
import { ref, onMounted } from 'vue';

const props = defineProps<{
	inChannel: Channel;
}>();

const displayAddAdmin = ref(false);
const displayRemoveAdmin = ref(false);
const users = ref(props.inChannel.admin as User[])

const emit = defineEmits<{
	(e: 'return'): void,
}>()

function displayButton() {
	return !displayAddAdmin.value && !displayRemoveAdmin.value
};

function close() {
     if (displayAddAdmin.value)
        displayAddAdmin.value = !displayAddAdmin.value
    else
        displayRemoveAdmin.value = !displayRemoveAdmin.value
}

function updateAdmin() {
    if (displayAddAdmin.value)
        displayAddAdmin.value = !displayAddAdmin.value
    else
        displayRemoveAdmin.value = !displayRemoveAdmin.value
    

}
</script>

<template>
    <div v-if="displayButton()" class="flex flex-col justify-between h-full">
        <div class="flex flex-col justify-center gap-8 h-full">
            <p class="text-sm">You can add or Remove Administrator for the channel</p>
            <p class="text-sm">number of Administrator : <span class="text-red-800">{{ inChannel.admin.length }}</span></p>
            <div class="flex flex-col justify-center gap-2 items-center">
                <button @click="displayAddAdmin = !displayAddAdmin" class="w-2/5 py-2 px-4 text-xs font-medium text-gray-800 bg-red-100 rounded border border-red-200 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
                    Add
                </button>
                <button @click="displayRemoveAdmin = !displayRemoveAdmin" class="w-2/5 py-2 px-4 text-xs font-medium text-gray-800 bg-red-100 rounded border border-red-200 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
                    Remove
                </button>
            </div>
        </div>
         <button-return @click="emit('return')" class="self-end"></button-return>
    </div>
    <PlayerDisplayList v-else @validate="updateAdmin()" @close="close" :users="users"></PlayerDisplayList>
</template>