<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import type Discussion from '@/types/Discussion'
import type Message from '@/types/Message'

const props = defineProps<{
	discussion: Discussion;
}>();

const lastMessage = ref(props.discussion.messages[props.discussion.messages.length - 1]);
</script>

<template>
    <button class="flex w-full gap-2 h-[60px] border-b-[1px] border-slate-600">
        <div class="shrink-0 flex items-center h-full">
            <img class="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover border border-slate-400" :src="discussion.user.avatar" alt="Rounded avatar">
        </div>
        <div class="flex flex-col justify-center h-full w-[calc(100%_-_56px)]">
            <div class="flex justify-between items-center">
                <span class="text-slate-700">{{ discussion.user.username }}</span>
                <span class="text-xs pr-4 text-slate-700">{{ lastMessage?.date }}</span>
            </div>
            <p v-if="lastMessage?.message != ''" class="w-full text-left truncate text-xs text-slate-700">{{ lastMessage?.message }}</p>
			<p v-else class="w-full text-left truncate text-xs text-slate-700">NO MESSAGES</p>
        </div>
    </button>
</template>