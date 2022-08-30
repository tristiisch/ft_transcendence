<script setup lang="ts">
import type Discussion from '@/types/Discussion'
import { useUserStore } from '@/stores/userStore'
import { useChatStore } from '@/stores/chatStore';
import { ref, watch } from 'vue';

const chatStore = useChatStore();
const userStore = useUserStore();
const props = defineProps<{
	discussion: Discussion;
    index: number;
}>();

const lastMessage = ref(props.discussion.messages[props.discussion.messages.length - 1]);

function prefix()
{
	if (lastMessage.value)
		if(lastMessage.value.idSender === userStore.userData.id)
			return 'you: '
}

function colorText(){
    if (props.index === 0 && chatStore.inDiscussion)
        return 'text-slate-400'
    else
        return 'text-slate-700'
}

watch(props.discussion.messages, () => {
	lastMessage.value = props.discussion.messages[props.discussion.messages.length - 1]
});

</script>

<template>
    <button class="flex w-full gap-2 h-[60px] border-b-[1px] border-slate-600">
        <div class="shrink-0 flex items-center h-full">
            <img class="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover border border-slate-400" :src="discussion.user.avatar" alt="Rounded avatar">
        </div>
        <div class="flex flex-col justify-center h-full w-[calc(100%_-_56px)] gap-1">
            <div class="flex justify-between items-center">
                <span class="text-sm" :class="colorText()">{{ discussion.user.username }}</span>
                <span v-if="lastMessage" class="pr-4 text-xs" :class="colorText()">{{ lastMessage.date }}</span>
            </div>
            <p v-if="lastMessage" class="w-full text-left truncate text-xs" :class="colorText()"><span>{{ prefix() }}</span>{{ lastMessage.message }}</p>
			<p v-else class="w-full text-left truncate text-xs" :class="colorText()">NO MESSAGES</p>
        </div>
    </button>
</template>