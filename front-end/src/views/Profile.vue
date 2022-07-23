<script setup lang="ts">
import UsersService from '@/services/UserService';
import type User from '@/types/User';
import Status from '@/types/Status';
import { useUserStore } from '@/stores/userStore';
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import PlayerHistory from '@/components/Profile/PlayerHistory.vue';
import CardRight from '@/components/CardRight.vue';
import PlayerStats from '@/components/Profile/PlayerStats.vue';
import CardLeft from '@/components/CardLeft.vue';
import RankCard from '@/components/Profile/RankCard.vue';
import PlayerProfile from '@/components/Profile/PlayerProfile.vue';
import ButtonGradient1 from '@/components/ButtonGradient1.vue';

const userStore = useUserStore();
const route = useRoute();
const user = ref({} as User);
const friends = ref([] as string[]);

async function fetchUser(name: string) {
	return await UsersService.getUserInfo(route.params.username as string)
		.then((response) => {
			user.value = response.data;
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

/*async function fetchMatchHistory(UserName: string, nbMatch: number) {
	return await UsersService.getUserInfo(route.params.id as string)
		.then((response) => {
			user.value = response.data;
		})
		.catch((e: Error) => {
			console.log(e);
		});
}*/

function isOnline() {
	return user.value.current_status === Status.ONLINE ? true : false;
}

function isInGame() {
	return user.value.current_status === Status.INGAME ? true : false;
}

async function fetchfriends() {
	await UsersService.getUserfriends(userStore.getUsername)
		.then((response) => {
			friends.value = response.data;
			console.log(response.data);
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

const friendButton = computed(() => {
	for (let i = 0; i < friends.value.length; i++) {
		if (route.params.username === friends.value[i]) return 'Remove friend';
	}
	return 'Add friend';
});

function treatFriendRequest() {
	if (friendButton.value === 'Add friend') UsersService.sendFriendRequest(userStore.getUsername, route.params.username as string);
	else UsersService.sendUnfriendRequest(userStore.getUsername, route.params.username as string);
	fetchfriends();
}

onMounted(() => {
	fetchUser(route.params.username as string);
	fetchfriends();
});
</script>

<template>
	<base-ui>
		<card-left>
			<player-profile :user="user"></player-profile>
			<div class="flex flex-col gap-4">
				<button-gradient1 @click="treatFriendRequest()"
					><span>{{ friendButton }}</span></button-gradient1
				>
				<button-gradient1><span>MESSAGE</span></button-gradient1>
			</div>
			<rank-card :rank="user.rank"></rank-card>
		</card-left>
		<card-right title="PLAYER STATS">
			<div class="w-4/5 h-1/4">
				<player-stats :user="user"></player-stats>
			</div>
			<div class="w-4/5 h-1/2">
				<player-history></player-history>
			</div>
		</card-right>
	</base-ui>
	<div class="background"></div>
</template>

<style scoped>
.background {
	top: 0;
	left: 0;
	position: fixed;
	margin: 0;
	background-image: url(@/assets/brick.jpg);
	background-size: cover;
	background-repeat: no-repeat;
	background-position: bottom;
	background-attachment: fixed;
	height: 100%;
	width: 100%;
	transform: scale(1.2);
	z-index: -100;
}
</style>
