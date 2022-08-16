<script setup lang="ts">
import type User from '@/types/User';
const props = defineProps<{
	user: User;
}>();
</script>

<template>
    <button class="flex w-full gap-2 h-[60px] border-b-[1px] border-slate-600">
        <div class="shrink-0 flex items-center h-full">
            <img class="w-12 h-12 rounded-full object-cover border-[1px] border-zinc-300" :src="user.avatar" alt="Rounded avatar">
        </div>
        <div class="flex flex-col justify-center h-full w-[calc(100%_-_48px)]">
            <div class="flex justify-between items-center">
                <span>{{ user.username }}</span>
                <span class="text-xs pr-4">12/03/22</span>
            </div>
            <p class="w-full truncate text-xs">WEFWKEFWE3po3j4j4rj4rpkpkpkopopkio34rio3</p>
        </div>
    </button>
</template>