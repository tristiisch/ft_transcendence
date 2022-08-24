<script setup lang="ts">
import users from '@/data/users';
import { useUserStore } from '@/stores/userStore';
import { ref, watch, onUpdated } from 'vue'
import type Message from '@/types/Message';
import type Channel from '@/types/Channel';
import type Discussion from '@/types/Discussion';
import BaseButton from '../BaseButton.vue';

const userStore = useUserStore();

const props = defineProps<{
	messages: Message[] | null
	inChannel: Channel | null
	inDiscussion: Discussion | null
}>();

const emit = defineEmits<{
	(e: 'scroll'): void
}>();

function searchPlayerAvatar(senderId: number) {
	let avatar
	if (props.inChannel)
    	avatar = (props.inChannel.users.find(element => element.id === senderId))?.avatar;
	else if (props.inDiscussion)
		avatar = userStore.userData.id === senderId ? userStore.userData.avatar : props.inDiscussion.user.avatar
    return avatar;
}

function playerName(senderId: number) {
	let name
	if (props.inChannel)
    	name = (props.inChannel.users.find(element => element.id === senderId))?.username;
	else if (props.inDiscussion)
		name = userStore.userData.id === senderId ? userStore.userData.username : props.inDiscussion.user.username
    return name;
}

function redirectTo(senderId: number)
{
	if (props.inChannel)
	{
		let userId = props.inChannel.users.find(element => element.id === senderId)?.id
		if  (userId) return { name: 'Profile', params: { id: userId }}
	}	
	else if (props.inDiscussion)
		return userStore.userData.id === senderId ? { name: 'Profile', params: { id: userStore.userData.id }} : { name: 'Profile', params: { id: props.inDiscussion.user.id }}
}

onUpdated(()=> {
    emit('scroll')
});

</script>

<template>
    <div v-if="messages" v-for="message in messages" :key="message.date" class="flex gap-2 w-full mt-3 mb-1.5 pl-8">
		<BaseButton link :to="redirectTo(message.id)">
			<img class="self-center h-8 w-8 shrink-0 rounded-full border-[1px] border-red-400 sm:self-start" :src="searchPlayerAvatar(message.id)">
		</BaseButton>
		<div class="flex flex-col gap-1 min-w-0">
			<div class="flex flex-col sm:items-center sm:gap-2 pt-1 text-red-300 sm:flex-row">
				<p class="text-sm ">{{ playerName(message.id) }}</p>
				<p class="text-xs">{{ message.date }}</p>
			</div> 
			<div class="text-sm min-w-0 text-red-200 break-words">{{ message.message }}</div>
		</div>
    </div>
</template>