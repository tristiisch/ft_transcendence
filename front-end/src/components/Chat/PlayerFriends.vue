<script setup lang="ts">
import type User from '@/types/User';
defineProps<{
	friend: User;
}>();
</script>

<template>
    <div class="flex w-full h-[60px] border-b-[1px] border-slate-600">
        <div class="flex items-center w-[20%] h-full">
            <img class="shrink-0 w-12 h-12 rounded-full object-cover border-[1px] border-zinc-300" :src="friend.avatar" alt="Rounded avatar">
        </div>
        <div class="flex flex-col justify-center w-[80%] h-full">
            <div class="flex justify-between items-center">
                <span>{{ friend.username }}</span>
                <span class="text-xs pr-4">12/03/22</span>
            </div>
            <P class="truncate text-xs">WEFWKEFWE3po3j4j4rj4rpkpkpkopopkio34rio3</P>
        </div>
    </div>
</template>