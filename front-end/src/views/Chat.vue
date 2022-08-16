<script setup lang="ts">
import type User from '@/types/User';
import type Channel from '@/types/Channel';
import UsersService from '@/services/UserService';
import { useUserStore } from '@/stores/userStore';
import CardLeft from '@/components/CardLeft.vue';
import CardRight from '@/components/CardRight.vue';
import ChannelsList from '@/components/Chat/ChannelsList.vue';
import Message from '@/components/Chat/Message.vue';
import AddChannel from '@/components/Chat/AddChannel.vue';
import ButtonPlus from '@/components/Chat/ButtonPlus.vue';
import ButtonDelete from '@/components/Chat/ButtonDelete.vue';
import AddSearchPlayer from '@/components/Chat/AddSearchPlayer.vue';
import InChatTopImage from '@/components/Chat/InChatTopImage.vue';
import { useRoute } from 'vue-router';
//import JoinChannelDiscussionRequestVue from '@/components/Chat/JoinChannelDiscussionRequest.vue';
import ChannelSettings from '@/components/Chat/ChannelSettings/ChannelSettings.vue';
import PlayerDiscussion from '@/components/Chat/PlayerDiscussion.vue';
import { ref, onMounted } from 'vue';
import socket from '@/plugin/socketInstance';


const userStore = useUserStore();
const route = useRoute();
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
const rightClick = ref([] as boolean[]);

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

function getUser(name: string): User | null {
	for (const user of users.value)
	{
		if(user.username === name)
			return user
	}
	return null
}

function fetchUsers() {
	UsersService.getUsers()
		.then((response) => {
			users.value = response.data;
			if (route.query.discussion)
			{
				const user = getUser(route.query.discussion as string)
				if (user) loadDiscussion(user)
			}
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
	else if (displayPart === 'addDiscussion') rightCardTitle.value = 'DISCUSSION';
	else if (displayPart === 'channelSettings') rightCardTitle.value = 'SETTINGS';
	else rightCardTitle.value = 'CHANNEL';
}

function setPartToDisplay(name: string | null) {
	if (name)
	{
		rightPartToDisplay.value = name
	}
	else
	{
		if (leftPartToDisplay.value === 'discussions')
		rightPartToDisplay.value = 'addDiscussion'
		else if (leftPartToDisplay.value === 'channels')
			rightPartToDisplay.value = 'createChannel'
		else
			rightPartToDisplay.value = 'chat'
	}
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
	if (inChannel.value) inChannel.value = null
	inChatWith.value = user
	rightPartToDisplay.value = 'chat'
}

function loadChannel( channel:Channel ) {
	if (inChatWith.value) inChatWith.value = null
	inChannel.value = channel
	rightPartToDisplay.value = 'chat'
}

function deleteChannelDiscussion(index:number)
{
	// let index = channels.value.findIndex(channel)
	// channels.value.splice(index, 1)
	console.log('yo')
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
					<div class="flex w-full justify-around gap-2 flex-wrap sm:pb-5 sm:border-b-[1px] sm:border-slate-700">
						<button @click="showFriends" class="font-Arlon tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">DISCUSSIONS</button>
						<button @click="showChannels" class="font-Arlon tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">CHANNELS</button>
					</div>
					<div class="flex flex-col justify-between h-full w-full">
						<div class="overflow-x-auto sm:overflow-y-auto h-[60px] sm:h-[300px] w-full">
							<div v-if="leftPartToDisplay === 'discussions'" v-for="friend, index) in friends" :key="friend.id" class="relative ">
								<player-discussion @click.right="rightClick[index]= !rightClick[index]" @click.left="loadDiscussion(friend)" :user="friend"></player-discussion>
								<button-delete v-if="rightClick[index]" @delete="deleteChannelDiscussion(index)" @close="rightClick[index]= !rightClick[index]"></button-delete>
							</div>
							<div v-else v-for="(channel, index) in channels" :key="channel.name" class="relative">
								<channels-list @click.right="rightClick[index]= !rightClick[index]" @click.left="loadChannel(channel)" :channel="channel"></channels-list>
								<button-delete v-if="rightClick[index]" @delete="deleteChannelDiscussion(index)" @close="rightClick[index]= !rightClick[index]"></button-delete>
							</div>
						</div>
						<div class="flex self-start items-center gap-4 ml-2">
							<button-plus @click="setPartToDisplay(null)"></button-plus>
							<label class="text-white">{{ addButtonText() }}</label>
						</div>
					</div>
				</div>
			</card-left>
			<card-right :title=rightCardTitle>
				<div v-if="rightPartToDisplay === 'chat'" class="w-11/12 px-8 3xl:px-10 h-full">
					<div v-if="inChatWith || inChannel" class="flex flex-col justify-between items-center h-full">
						<InChatTopImage @clickOnChannelSettings="setPartToDisplay('channelSettings')" :inChatWith="inChatWith" :inChannel="inChannel"></InChatTopImage>
						<div class="flex flex-col w-full h-[calc(100%_-_36px)] overflow-y-auto" ref="scroll">
							<message @scroll="scrollToEnd" :messages="messages" :users="users"></message>
						</div>
						<div class="w-full flex justify-between gap-3">
							<button v-if="inChannel" @click="setPartToDisplay('channelSettings')">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="#F87171">
									<path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
								</svg>
							</button>
							<form @submit.prevent="sendMessage()" class="w-full">
								<input v-model="newMessage" class="text-sm  w-full p-2 bg-gray-700 rounded-lg text-white">	
							</form>
							<button class="bg-lime-400 rounded-lg p-2">
								<svg xmlns="http://www.w3.org/2000/svg" width="30" height="18" viewBox="0 0 512 266"><path d="M7.533 14.629L14.3 7.86c10.371-10.262 27.292-9.607 36.79 1.42l93.666 109.168c8.188 9.497 8.079 23.58-.218 32.969L51.2 257.2c-9.607 10.808-26.31 11.353-36.571 1.092l-6.769-6.769c-9.17-9.17-9.825-23.799-1.528-33.842l55.894-67.03c7.642-9.17 7.751-22.38.328-31.768L5.786 47.924C-2.293 38.1-1.528 23.69 7.533 14.63z" fill="#92D13D"/><path d="M62.117 150.87L6.223 217.9c-8.297 9.935-7.642 24.672 1.528 33.842l6.768 6.769c10.262 10.262 26.965 9.716 36.572-1.092l20.196-22.925c7.642-15.065 11.9-32.096 11.9-50.108 0-22.27-6.55-42.904-17.686-60.261 4.148 8.515 3.057 19.104-3.384 26.746zM192.791 214.516h-21.724V88.208h21.724v13.21c3.057-8.843 14.083-15.175 29.148-15.175 12.882 0 23.69 4.585 32.423 13.755 8.843 9.061 13.21 20.306 13.21 33.843 0 13.536-4.367 24.78-13.21 34.06-8.733 9.061-19.54 13.537-32.423 13.537-15.065 0-26.09-6.332-29.148-15.174v48.252zm6.332-100.544c-5.24 5.24-7.97 12.008-7.97 19.978 0 7.969 2.73 14.628 7.97 19.978 5.459 5.24 12.118 7.969 19.978 7.969 7.86 0 14.083-2.73 19.214-7.97 5.24-5.24 7.75-12.008 7.75-19.977 0-7.97-2.51-14.629-7.75-19.978-5.022-5.24-11.463-7.97-19.214-7.97-7.75 0-14.52 2.73-19.978 7.97zm75.981-60.698h21.725v96.396c0 8.843 2.948 12.663 10.917 12.663 2.51 0 4.694-.218 6.55-.764v19.432c-2.51.764-6.004 1.092-10.371 1.092-19.214 0-28.82-9.825-28.82-29.585V53.274zm112.771 48.143V88.208H409.6v63.754c0 7.751 1.856 10.699 6.66 10.699 1.31 0 2.947-.218 4.584-.328v17.577c-2.401.873-6.004 1.419-10.698 1.419-5.24 0-9.389-.874-12.664-2.948-4.039-2.729-6.55-6.332-7.423-11.026-6.332 9.607-16.812 14.301-31.331 14.301-12.882 0-23.69-4.476-32.642-13.755-8.733-9.28-13.1-20.524-13.1-34.06 0-13.537 4.367-24.782 13.1-33.843 8.843-9.279 19.76-13.755 32.642-13.755 14.628 0 25.654 6.55 29.147 15.174zm-6.55 52.401c5.459-5.24 8.188-12.008 8.188-19.977 0-7.97-2.73-14.63-8.188-19.978-5.24-5.24-12.008-7.97-19.76-7.97-7.75 0-14.082 2.73-19.431 7.97-5.022 5.24-7.642 12.008-7.642 19.978 0 7.969 2.511 14.628 7.642 19.977 5.24 5.24 11.572 7.97 19.432 7.97 7.86 0 14.52-2.73 19.76-7.97zm47.052 43.995c2.73.874 6.113 1.42 10.153 1.42 3.493 0 6.004-.765 7.969-1.966 1.965-1.2 3.82-4.039 5.24-7.75l2.402-6.55-38.21-94.759h21.834l26.856 68.885 25.218-68.885h21.943L470.843 194.43c-2.729 7.096-6.004 12.554-9.825 16.266-5.458 5.022-12.663 7.642-21.943 7.642-4.039 0-7.641-.546-10.698-1.42v-19.104z" fill="#49691F"/></svg>
							</button>
						</div>
					</div>
				</div>
				<!-- <div v-else-if="rightPartToDisplay === 'joinRequest'" class="flex flex-col justify-between items-center w-11/12 px-6 3xl:px-10 h-full">
					<join-request @close="setPartToDisplay('chat')" @validate="invitePlayer" :inChannel="inChannel"></join-request>
				</div> -->
				<div v-else-if="rightPartToDisplay === 'channelSettings' && inChannel" class="flex flex-col w-11/12 px-6 3xl:px-10">
					<channel-settings @return="setPartToDisplay('chat')" @validate="invitePlayer" :inChannel="inChannel"></channel-settings>
				</div>
				<div v-else-if="rightPartToDisplay === 'addDiscussion'" class="flex flex-col justify-between items-center w-11/12 px-6 3xl:px-10 h-full">
					<AddSearchPlayer @close="setPartToDisplay('chat')" @validate="invitePlayer"></AddSearchPlayer>
				</div>
				<div v-else class="w-11/12 px-6 3xl:px-10 h-full">
					<add-channel @close="setPartToDisplay('chat')" @validate="invitePlayer"></add-channel>
				</div>
			</card-right>
		</div>
	</base-ui>
</template>
