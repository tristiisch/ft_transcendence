<script setup lang="ts">
import type User from '@/types/User';
const props = defineProps<{
	user: User;
}>();
</script>

<template>
    <button class="flex w-full gap-2 h-[60px] border-b-[1px] border-slate-600">
        <div class="shrink-0 flex items-center h-full">
            <img class="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover border border-slate-400" :src="user.avatar" alt="Rounded avatar">
        </div>
        <div class="flex flex-col justify-center h-full w-[calc(100%_-_56px)]">
            <div class="flex justify-between items-center">
                <span class="text-slate-700">{{ user.username }}</span>
                <span class="text-xs pr-4 text-slate-700">12/03/22</span>
            </div>
            <p class="w-full truncate text-xs text-slate-700">WEFWKEFWE3po3j4j4rj4rpkpkpkopopkio34rio3</p>
        </div>
    </button>
</template>