<script setup lang="ts">
import type User from '@/types/User';
import UsersService from '@/services/UserService';
import { useUserStore } from '@/stores/userStore';
import CardLeft from '@/components/CardLeft.vue';
import CardRight from '@/components/CardRight.vue';
import PlayerFriends from '@/components/Chat/PlayerFriends.vue';
import Channels from '@/components/Chat/Channels.vue';
import Message from '@/components/Chat/Message.vue';
import { ref, onMounted, computed, onBeforeMount, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue';
import socket from '@/socket';

const userStore = useUserStore();
const users = ref([] as User[]);
// const userSocket = ref({} as {userID: string, username: string});
const friends = ref([] as User[]);
const showItems = ref( 'friends' );
const messages = ref([] as {message: string, sender: string, date: string}[]);
const newMessage = ref('')
const scroll = ref<HTMLInputElement | null>(null)

function showFriends () {
	if (showItems.value != 'friends')
		showItems.value = 'friends'
}

function showChannels () {
	if (showItems.value != 'channels')
		showItems.value = 'channels'
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
				<div class="flex flex-col justify-start items-center h-full px-6">
					<div class="flex w-full justify-around py-4 sm:pb-10 sm:border-b-[1px] sm:border-slate-700">
						<button @click="showFriends" class="font-Arlon tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">FRIENDS</button>
						<button @click="showChannels" class="font-Arlon tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">CHANNELS</button>
					</div>
					<div class="overflow-x-auto sm:overflow-y-auto h-[60px] sm:h-[300px] w-full">
						<div v-for="friend in friends" :key="friend.id">
							<player-friends v-if="showItems === 'friends'" :friend="friend"></player-friends>
							<channels v-else :friend="friend"></channels>
						</div>
					</div>
				</div>
			</card-left>
			<card-right title="CHAT">
				<div class="flex flex-col justify-between items-center w-11/12 px-12 h-full">
					<div class="flex flex-col w-full h-[calc(100%_-_36px)] border-t-[1px] border-red-300 overflow-y-auto" ref="scroll">
						<message :messages="messages" :users="users"></message>
					</div>
					<form @submit.prevent="sendMessage()" class="w-full">
						<input v-model="newMessage" class="text-sm w-full p-2 bg-gray-700 rounded-lg text-white">
					</form>
				</div>
			</card-right>
		</div>
	</base-ui>
</template>
