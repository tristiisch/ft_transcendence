<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '@/stores/chatStore';
import socket from '@/plugin/socketInstance';

const chatStore = useChatStore();
const password = ref('')
const passwordError = ref(false);

function checkPassword()
{
    socket.emit('chatPassCheck', chatStore.inChannel, password.value, (ok: boolean) => {
        if (ok)
            chatStore.registrationToChannel()
        else {
            passwordError.value = true
            password.value = ''
        }
    });
}
</script>

<template>
    <div class="flex flex-col justify-center items-center gap-2 rounded h-full">
        <p class="text-red-200 pb-4">This channel is <span class="text-red-800">PROTECTED</span></p>
        <form @submit.prevent="checkPassword()">
            <input v-model="password" placeholder="Enter password" class="text-sm w-full p-2 text-center bg-neutral-100 border border-blue-600 rounded-lg text-blue-600 placeholder:text-slate-300 placeholder:text-center">
        </form>
        <p v-if="passwordError && password === ''" class="flex gap-3 text-red-700 pt-4"><span class="-hue-rotate-[50deg]">⚠️</span>wrong password</p>
    </div>
</template>