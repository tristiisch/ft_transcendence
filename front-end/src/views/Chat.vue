<script setup lang="ts">
import type User from '@/types/User';
import UsersService from '@/services/UserService';
import { useUserStore } from '@/stores/userStore';
import CardLeft from '@/components/CardLeft.vue';
import CardRight from '@/components/CardRight.vue';
import { ref, onMounted, computed, onBeforeMount, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue';

const userStore = useUserStore();
const users = ref([] as User[]);
const friends = ref([] as User[]);

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
				<div class="flex flex-col items-center h-full w-full px-6">
					<h1 class="font-Arlon tracking-tight text-2xl pb-2 sm:text-3xl sm:border-b-[1px] sm:border-slate-700 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">CHANELS</h1>
					<div class="h-[40%] w-full bg-white"></div>
					<h1 class="font-Arlon tracking-tight text-2xl py-2 sm:text-3xl sm:border-b-[1px] sm:border-slate-700 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">FRIENDS</h1>
					<div v-for="friend in friends" :key="friend.id" class="h-[40%] w-full">
						<div class="flex w-full h-[50px] border-b-[1px]">
							<div class="bg-cyan-400 inline-block w-[20%] h-full">
								<img class="w-12 h-12 rounded-full object-cover border-[1px] border-zinc-300" :src="friend.avatar" alt="Rounded avatar">
							</div>
							<div class="bg-cyan-400 inline-block w-[80%] h-full">
								<div class="flex justify-between items-center">
									<span>{{ friend.username }}</span>
									<span class="text-xs pr-4">12/03/22</span>
								</div>
								<P class="break-words truncate text-xs">WEFWKEFWE3po3j4j4rj4rpk4rop34rop3k4rop34kr34rpo34kp3k4k34rkpo3o4kk34kr34r34r34rj34irr34r34io34rio3j4r34rFerf;ekrferkfkekop3krorkfWEFNJKWENFKJWEFrp34r34ioj34ro34rWEF</P>
							</div>
						</div>
					</div>
				</div>
			</card-left>
			<card-right title="CHAT">
				<div class="flex flex-col justify-center items-center w-full h-full">
					<div class="h-full w-5/6 overflow-y-auto border-t-[1px] border-red-300"></div>
					<input type="text" class="w-5/6 p-2  bg-gray-700 rounded-lg text-white ">
				</div>
			</card-right>
		</div>
	</base-ui>
</template>
