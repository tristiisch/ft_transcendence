<script setup lang="ts">
import type User from '@/types/User';
defineProps<{
	friend: User;
}>();
</script>

<template>
     <div class="flex items-center w-full h-[60px] border-b-[1px] border-slate-600">
        <div class="flex items-center w-[20%] h-full">
            <img class="w-12 h-12 rounded object-cover border-[1px] border-zinc-300" :src="friend.avatar" alt="Rounded avatar">
        </div>
        <p class="w-[80%] pl-4">TSV</p>
    </div>
</template>