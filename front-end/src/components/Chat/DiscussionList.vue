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

const numberOfUnreadedMessage = computed(() => {
    const nb = chatStore.nbUnreadMessageInDiscussion(props.discussion);
    return nb;
})

watch(props.discussion.messages, () => {
	lastMessage.value = props.discussion.messages[props.discussion.messages.length - 1]
});

</script>

<template>
    <button class="flex w-full gap-2 h-full border-b-[1px] border-slate-600">
        <div class="shrink-0 flex items-center h-full">
            <img class="aspect[1/1] h-8 sm:h-[80%] rounded-full object-cover border border-slate-400" :src="discussion.user.avatar" alt="Rounded avatar">
        </div>
        <div class="flex flex-col justify-center h-full w-[calc(100%_-_56px)] gap-1">
            <div class="flex justify-between items-center">
                <span class="text-sm" :class="colorText()">{{ discussion.user.username }}</span>
                <span v-if="lastMessage" class="pr-4 text-xs" :class="colorText()">{{ lastMessage.date }}</span>
            </div>
            <div class="flex justify-between items-center">
                <p v-if="lastMessage" class="w-full text-left truncate text-xs" :class="colorText()"><span>{{ prefix() }}</span>{{ lastMessage.message }}</p>
			    <p v-else class="w-full text-left truncate text-xs" :class="colorText()">NO MESSAGES</p>
                <div v-if="numberOfUnreadedMessage" class="bg-red-600 rounded-full px-2 text-xs text-white mr-4">{{ numberOfUnreadedMessage }}</div>
            </div>
        </div>
    </button>
</template>