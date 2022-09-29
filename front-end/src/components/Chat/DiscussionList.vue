<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'
import { useChatStore } from '@/stores/chatStore';
import { computed, ref, watch } from 'vue';
import type Discussion from '@/types/Discussion'
import type Message from '@/types/Message'

const chatStore = useChatStore();
const userStore = useUserStore();
const props = defineProps<{
	discussion: Discussion;
    index: number;
}>();

const lastMessage = ref<Message>();
if (props.discussion.messages && props.discussion.messages.length)
    lastMessage.value = props.discussion.messages[props.discussion.messages.length - 1];

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

function borderColor() {
	if (props.index === 0 && chatStore.inDiscussion)
        return 'border-[#f1cf3b]'
    else
        return 'border-slate-400'
}

const numberOfUnreadedMessage = computed(() => {
    const nb = chatStore.nbUnreadMessageInDiscussion(props.discussion);
    return nb;
})

function firstCard() {
	if (props.index === 0)
		return 'border-t-[1px]'
}

watch(props.discussion.messages, () => {
	lastMessage.value = props.discussion.messages[props.discussion.messages.length - 1]
});

</script>

<template>
    <button :class="firstCard()" class="relative flex items-center w-full h-full border-b-[1px] border-slate-600">
        <img class="aspect-square h-8 sm:h-[80%] rounded-full object-cover border border-[1.5px]" :class="borderColor()" :src="discussion.user.avatar" alt="Rounded avatar">
		<div v-if="numberOfUnreadedMessage" class="absolute flex justify-center items-center bottom-1 sm:bottom-2 bg-red-600 w-3 h-3 sm:w-4 sm:h-4 rounded-full text-xxxs sm:text-xxs text-white">{{ numberOfUnreadedMessage }}</div>
        <div class="flex flex-col justify-center w-[calc(100%_-_32px)] sm:w-[calc(100%_-_75px)] 3xl:w-[calc(100%_-_68px)] h-full gap-1 pl-2">
            <div class="flex flex-wrap justify-between items-center">
                <span class="text-sm" :class="colorText()">{{ discussion.user.username }}</span>
                <span v-if="lastMessage" class="text-xxs" :class="colorText()">{{ lastMessage.date.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center">
                <p v-if="lastMessage" class="text-left truncate text-xs" :class="colorText()"><span>{{ prefix() }}</span>{{ lastMessage.message }}</p>
			    <p v-else class="text-left truncate text-xs" :class="colorText()">NO MESSAGES</p>
            </div>
        </div>
    </button>
</template>