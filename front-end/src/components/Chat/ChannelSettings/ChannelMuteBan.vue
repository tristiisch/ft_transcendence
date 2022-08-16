<script setup lang="ts">
import type Channel from '@/types/Channel';
import type User from '@/types/User';
import PlayerDisplayList from '@/components/Chat/PlayerDisplayList.vue'
import ButtonReturn from '@/components/Chat/ButtonReturn.vue';
import { ref } from 'vue';

const props = defineProps<{
	inChannel: Channel;
}>();

const displayMute = ref(false);
const displayBan = ref(false);
const users = ref(props.inChannel.admin as User[])

const emit = defineEmits<{
	(e: 'return'): void,
}>()

function displayButton() {
	return !displayBan.value && !displayMute.value
};

function close() {
     if (displayBan.value)
        displayBan.value = !displayBan.value
    else
        displayMute.value = !displayMute.value
}

function update() {
    if (displayBan.value)
        displayBan.value = !displayBan.value
    else
        displayMute.value = !displayMute.value
    

}
</script>

<template>
    <div v-if="displayButton()" class="flex flex-col justify-between h-full">
        <div class="flex flex-col justify-center gap-8 h-full">
            <div class="flex flex-col justify-center gap-2 items-center">
                <button @click="displayMute = !displayMute" class="w-2/5 py-2 px-4 text-xs font-medium text-gray-800 bg-red-100 rounded border border-red-200 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
                    Mute
                </button>
                <button @click="displayBan = !displayBan" class="w-2/5 py-2 px-4 text-xs font-medium text-gray-800 bg-red-100 rounded border border-red-200 sm:text-sm hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
                    Ban
                </button>
            </div>
        </div>
         <button-return @click="emit('return')" class="self-end"></button-return>
    </div>
    <PlayerDisplayList v-else @validate="update()" @close="close" :users="users"></PlayerDisplayList>
</template>