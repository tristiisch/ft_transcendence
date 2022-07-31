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

const userStore = useUserStore();
const users = ref([] as User[]);
const friends = ref([] as User[]);
const showItems = ref( 'friends' );;

function showFriends () {
	if (showItems.value != 'friends')
		showItems.value = 'friends'
}

function showChannels () {
	if (showItems.value != 'channels')
		showItems.value = 'channels'
}

async function fetchUsers() {
	await UsersService.getUsers()
		.then((response) => {
			users.value = response.data;
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

async function fetchfriends() {
	await UsersService.getUserfriends(userStore.userData.username)
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

onMounted(() => {
	fetchUsers();
	fetchfriends();
});
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
					<div class="overflow-x-scroll sm:overflow-y-scroll h-[60px] sm:h-[300px] w-full">
						<div v-for="friend in friends" :key="friend.id">
							<player-friends v-if="showItems === 'friends'" :friend="friend"></player-friends>
							<channels v-else :friend="friend"></channels>
						</div>
					</div>
				</div>
			</card-left>
			<card-right title="CHAT">
				<div class="flex flex-col justify-center items-center w-11/12 px-12 h-full">
					<div class="flex flex-col w-full h-full border-t-[1px] border-red-300">
						<message></message>
					</div>
					<input type="text" class="text-sm w-full p-2 bg-gray-700 rounded-lg text-white">
				</div>
			</card-right>
		</div>
	</base-ui>
</template>
