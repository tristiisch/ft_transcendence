<script setup lang="ts">
import type User from '@/types/User';
import type Channel from '@/types/Channel';
import ChannelStatus from '@/types/ChannelStatus';
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
import ChatTopImage from '@/components/Chat/ChatTopImage.vue';
import { useRoute } from 'vue-router';
//import JoinChannelDiscussionRequestVue from '@/components/Chat/JoinChannelDiscussionRequest.vue';
import ChannelSettings from '@/components/Chat/ChannelSettings/ChannelSettings.vue';
import PlayerDiscussion from '@/components/Chat/PlayerDiscussion.vue';
import { ref, onMounted } from 'vue';
import socket from '@/plugin/socketInstance';
import Status from '@/types/Status';


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
const isRegistered= ref(false);

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
	if (inChannel.value.type === ChannelStatus.PROTECTED)
	{
		for (const user of inChannel.value.users)
			if (user.username === userStore.userData.username)
				isRegistered.value = true;
	}
}			

function deleteChannelDiscussion(index:number)
{
	// let index = channels.value.findIndex(channel)
	// channels.value.splice(index, 1)
	console.log('yo')
}

function checkRegistration()
{
	if (inChannel.value)
	{
		
	}	
	return false
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
							<label class="text-slate-700">{{ addButtonText() }}</label>
						</div>
					</div>
				</div>
			</card-left>
			<card-right :title=rightCardTitle>
				<div v-if="rightPartToDisplay === 'chat'" class="w-11/12 px-8 3xl:px-10 h-full">
					<div v-if="inChatWith || inChannel" class="h-full">
						<div v-if="inChannel && inChannel.type === ChannelStatus.PROTECTED && !isRegistered" class="flex flex-col justify-center items-center gap-2 rounded h-full">
							<div>
								<p class="text-red-200 pb-4">This channel is <span class="text-red-800">PROTECTED</span></p>
								<form @submit.prevent="sendMessage()">
									<input v-model="newMessage" placeholder="Enter password" class="text-sm w-full p-2 bg-red-100 rounded-lg text-white">	
								</form>
							</div>
						</div>
						<div v-else class="flex flex-col justify-between h-full">
							<chatTopImage @clickOnChannelSettings="setPartToDisplay('channelSettings')" :inChatWith="inChatWith" :inChannel="inChannel"></chatTopImage>
							<div class="flex flex-col w-full h-[calc(100%_-_36px)] overflow-y-auto" ref="scroll">
								<message @scroll="scrollToEnd" :messages="messages" :users="users"></message>
							</div>
							<div class="w-full flex justify-between gap-3">
								<form @submit.prevent="sendMessage()" class="w-full">
									<input v-model="newMessage" class="text-sm  w-full p-2 bg-gray-700 rounded-lg text-white">	
								</form>
								<button v-if="inChatWith" class="bg-lime-400 rounded-lg px-2">
									<img src="@/assets/inGame.png" class="w-10" />
								</button>
								<button v-if="inChannel" @click="setPartToDisplay('channelSettings')">
									<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="#F87171">
										<path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
									</svg>
								</button>
							</div>
						</div>
					</div>
				</div>
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
