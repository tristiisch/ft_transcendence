<script setup lang="ts">
import QRCode from '@/components/Profile/QRCode.vue';
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
const userStore = useUserStore();
const userName = ref(userStore.userData.username);
</script>

<template>
    <h1 class="text-center text-red-200 sm:text-xl mx-6 w-3/4 md:text-xl py-3 border-b-[1px] border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500">
                            Activation 2FA
    </h1>
    <q-r-code></q-r-code>
    <h1 class="text-center text-red-200 sm:text-xl mx-6 w-3/4 md:text-xl py-3 border-b-[1px] border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500">
            Edit Profile
    </h1>
    <div class="w-full px-10">
        <h2 class="text-left mb-4 text-red-800 text-lg">Change Username:</h2>
        <div class="flex items-center w-full gap-2 mb-4">
            <p>Username:</p>
            <form class="w-full">
                <input
                    class="placeholder-red-200 w-full bg-red-400 text-center font-medium text-xs py-1 px-3 text-red-200 sm:px-5 md:text-sm md:px-8"
                    type="text"
                    name="username"
                    v-model.trim=userName
                    :placeholder=userStore.userData.username
                />
            </form>
        </div>
        <h2 class="text-left mb-4 text-red-800 text-lg">Change Avatar:</h2>
        <div class="flex items-center gap-2">
            <input class="block mb-5 w-full text-sm cursor-pointer focus:outline-none text-red-300 file:py-1 file:text-sm file:bg-red-700 file:border-0 file:text-red-200" type="file">
        </div>
    </div>
    <base-button class="self-end mr-6 bg-blue-600 py-1 px-5 text-white">Save</base-button>
    <h1 class="text-center text-red-200 sm:text-xl mx-6 w-3/4 md:text-xl py-3 border-b-[1px] border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500">
            Remove Profile
    </h1>
    <base-button class="mr-6 bg-blue-600 py-1 px-5 text-white">Delete</base-button>
 </template>