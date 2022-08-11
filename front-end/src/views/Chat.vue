<script setup lang="ts">
import type User from '@/types/User';
import type Channel from '@/types/Channel';
import UsersService from '@/services/UserService';
import { useUserStore } from '@/stores/userStore';
import CardLeft from '@/components/CardLeft.vue';
import CardRight from '@/components/CardRight.vue';
import PlayerDiscussion from '@/components/Chat/PlayerDiscussion.vue';
import Channels from '@/components/Chat/Channels.vue';
import Message from '@/components/Chat/Message.vue';
import AddSearchPlayerVue from '@/components/Chat/AddSearchPlayer.vue';
import AddChannel from '@/components/Chat/AddChannel.vue';
import ButtonPlus from '@/components/Chat/ButtonPlus.vue';
import { ref, onMounted } from 'vue';
import socket from '@/plugin/socketInstance';
import AddSearchPlayer from '@/components/Chat/AddSearchPlayer.vue';
import InChatTopImage from '@/components/Chat/InChatTopImage.vue';

const userStore = useUserStore();
const users = ref([] as User[]);
const channels = ref([] as Channel[]);
const friends = ref([] as User[]);
const leftPartToDisplay = ref( 'discussions' );
const messages = ref([] as {message: string, sender: string, date: string}[]);
const newMessage = ref('')
const scroll = ref<HTMLInputElement | null>(null)
const rightCardTitle = ref('CHAT');
const rightPartToDisplay = ref('chat');
const inChatWith = ref<User | null>(null);
const inChannel = ref<Channel | null>(null);

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

function fetchChannels() {
	UsersService.getChannels()
		.then((response) => {
			channels.value = response.data;
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

function invitePlayer() {
	setRightCardTitle('chat')
	rightPartToDisplay.value = 'chat'
}

function addButtonText() {
	if (leftPartToDisplay.value === 'discussions')
		return 'Add discussion'	
	else
		return 'Add channel'
}



function loadDiscussion( user:User ) {
	inChatWith.value = null;
	inChatWith.value = user

}

function loadChannel( channel:Channel ) {
	inChatWith.value = null;
	inChannel.value = channel

}

onMounted(() => {
	fetchUsers();
	fetchfriends();
	fetchChannels();
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
						<div v-if="leftPartToDisplay === 'discussions'" v-for="friend in friends" :key="friend.id">
							<player-discussion  @click="loadDiscussion(friend)" :friend="friend"></player-discussion>
						</div>
						<div v-else v-for="channel in channels" :key="channel.name">
							<channels :channel="channel" @click="loadChannel(channel)"></channels>
						</div>
					</div>
					<div class="flex self-start items-center gap-4 ml-2">
						<button-plus @click="setPartToDisplay"></button-plus>
						<label class="text-white">{{ addButtonText() }}</label>
					</div>
				</div>
			</card-left>
			<card-right :title=rightCardTitle>
				<div v-if="rightPartToDisplay === 'chat'" class="w-11/12 px-12 h-full">
					<div v-if="inChatWith || inChannel" class="flex flex-col justify-between items-center h-full">
						<InChat-TopImage :inChatWith=inChatWith :inChannel=inChannel></InChat-TopImage>
						<div class="flex flex-col w-full h-[calc(100%_-_36px)] overflow-y-auto" ref="scroll">
							<message @scroll="scrollToEnd" :messages="messages" :users="users"></message>
						</div>
						<form @submit.prevent="sendMessage()" class="w-full">
							<input v-model="newMessage" class="text-sm w-full p-2 bg-gray-700 rounded-lg text-white">
						</form>
					</div>
				</div>
				<div v-else-if="rightPartToDisplay === 'addDiscussion'" class="flex flex-col justify-between items-center w-11/12 px-10 h-full">
					<AddSearchPlayer @close="rightPartToDisplay = 'chat', setRightCardTitle('chat')" @validate="invitePlayer"></AddSearchPlayer>
				</div>
				<div v-else class="w-11/12 px-6 sm:px-12 h-full">
					<Add-Channel @close="rightPartToDisplay = 'chat', setRightCardTitle('chat')" @validate="invitePlayer"></Add-Channel>
				</div>
			</card-right>
		</div>
	</base-ui>
</template>
