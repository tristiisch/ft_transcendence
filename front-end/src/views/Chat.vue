<script setup lang="ts">
import type User from '@/types/User';
import UsersService from '@/services/UserService';
import { useUserStore } from '@/stores/userStore';
import CardLeft from '@/components/CardLeft.vue';
import CardRight from '@/components/CardRight.vue';
import PlayerFriends from '@/components/Chat/PlayerFriends.vue';
import Channels from '@/components/Chat/Channels.vue';
import Message from '@/components/Chat/Message.vue';
import AddDiscussion from '@/components/Chat/AddDiscussion.vue';
import AddChannel from '@/components/Chat/AddChannel.vue';
import { ref, onMounted } from 'vue';
import socket from '@/plugin/socketInstance';

const userStore = useUserStore();
const users = ref([] as User[]);
const friends = ref([] as User[]);
const leftPartToDisplay = ref( 'discussions' );
const messages = ref([] as {message: string, sender: string, date: string}[]);
const newMessage = ref('')
const scroll = ref<HTMLInputElement | null>(null)
const rightCardTitle = ref('CHAT');
const rightPartToDisplay = ref('chat');

//socket.auth = [userStore.userData.username];
//socket.connect();

function showFriends () {
	if (leftPartToDisplay.value != 'discussions')
		leftPartToDisplay.value = 'discussions'
	if (rightPartToDisplay.value != 'chat')
		rightPartToDisplay.value = 'chat'
	setRightCardTitle(rightPartToDisplay.value)
}

function showChannels () {
	if (leftPartToDisplay.value != 'channels')
		leftPartToDisplay.value = 'channels'
	if (rightPartToDisplay.value != 'chat')
		rightPartToDisplay.value = 'chat'
	setRightCardTitle(rightPartToDisplay.value)
}

function fetchUsers() {
	UsersService.getUsers()
		.then((response) => {
			users.value = response.data;
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

function fetchfriends() {
	UsersService.getUserfriends(userStore.userData.username)
		.then((response) => {
			for (let i = 0; i < response.data.length; i++) {
				users.value.find((user) => {
					if (user.username === response.data[i]) friends.value.push(user);
				});
			}
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

function setRightCardTitle(displayPart: string) {
	if (displayPart === 'chat') rightCardTitle.value = 'CHAT';
	else if (displayPart === 'addDiscussion') rightCardTitle.value = 'ADD DISCUSSION';
	else rightCardTitle.value = 'CREATE CHANNEL';
}

function setPartToDisplay() {
	if (leftPartToDisplay.value === 'discussions')
		rightPartToDisplay.value = 'addDiscussion'	
	else if (leftPartToDisplay.value === 'channels')
		rightPartToDisplay.value = 'createChannel'	
	else
		rightPartToDisplay.value = 'chat'
	setRightCardTitle(rightPartToDisplay.value)
}

socket.on("chat-message", (data) => {
		console.log(data.sender)
        messages.value.push({
            message: data.message,
            sender: data.sender,
			date: data.date
          });
		  console.log(data)
		  console.log(messages.value)
        });


function scrollToEnd() {
    if (scroll.value) {
    	scroll.value.scrollTop = scroll.value.scrollHeight
  	}
    };

function sendMessage() {
	const now = new Date()
	messages.value.push({
		message: newMessage.value,
		sender: userStore.userData.username,
		date: "2022/09/8"
	});
	socket.emit("chat-message", {
	message: newMessage.value,
	sender: userStore.userData.username,
	date: "2022/09/8"
	});
	newMessage.value = '';
	scrollToEnd()
};

onMounted(() => {
	fetchUsers();
	fetchfriends();
});

// onbeforeunload = () => {
// 	socket.emit("leave", username);
// 	};

</script>

<template>
	<base-ui>
		<div class="flex flex-col h-full sm:flex-row">
			<card-left>
				<div class="flex flex-col justify-between items-center h-full px-8">
					<div class="flex w-full justify-around py-4 sm:pb-10 sm:border-b-[1px] sm:border-slate-700">
						<button @click="showFriends" class="font-Arlon tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">DISCUSSIONS</button>
						<button @click="showChannels" class="font-Arlon tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">CHANNELS</button>
					</div>
					<div class="overflow-x-auto sm:overflow-y-auto h-[60px] sm:h-[300px] w-full">
						<div v-for="friend in friends" :key="friend.id">
							<player-friends v-if="leftPartToDisplay === 'discussions'" :friend="friend"></player-friends>
							<channels v-else :friend="friend"></channels>
						</div>
					</div>
					<button @click="setPartToDisplay" class="self-end bg-green-600 text-green-200 hover:text-white rounded-lg focus:ring-2 focus:ring-gray-300 p-1 sm:p-2 inline-flex h-6 w-6 sm:h-9 sm:w-9">
                    	<svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" ></path></svg>
                	</button>
				</div>
			</card-left>
			<card-right :title=rightCardTitle>
				<div v-if="rightPartToDisplay === 'chat'" class="flex flex-col justify-between items-center w-11/12 px-12 h-full">
					<div class="flex flex-col w-full h-[calc(100%_-_36px)] border-t-[1px] border-red-300 overflow-y-auto" ref="scroll">
						<message @scroll="scrollToEnd" :messages="messages" :users="users"></message>
					</div>
					<form @submit.prevent="sendMessage()" class="w-full">
						<input v-model="newMessage" class="text-sm w-full p-2 bg-gray-700 rounded-lg text-white">
					</form>
				</div>
				<div v-else-if="rightPartToDisplay === 'addDiscussion'" class="flex flex-col justify-between items-center w-11/12 px-10 h-full">
					<Add-Discussion></Add-Discussion>
				</div>
				<div v-else class="flex flex-col items-center w-11/12 px-12 h-full">
					<Add-Channel></Add-Channel>
				</div>
			</card-right>
		</div>
	</base-ui>
</template>
