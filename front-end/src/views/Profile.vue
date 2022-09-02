<script setup lang="ts">
import UsersService from '@/services/UserService';
import type User from '@/types/User';
import type Stats from '@/types/Stats';
import { useUserStore } from '@/stores/userStore';
import { ref, onBeforeMount, watch, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PlayerHistory from '@/components/Profile/PlayerHistory.vue';
import CardRight from '@/components/CardRight.vue';
import PlayerStats from '@/components/Profile/PlayerStats.vue';
import CardLeft from '@/components/CardLeft.vue';
import RankCard from '@/components/Profile/RankCard.vue';
import PlayerProfile from '@/components/Profile/PlayerProfile.vue';
import ButtonPart from '@/components/Profile/ButtonPart.vue';
import Notifications from '@/components/Profile/Notifications.vue';
import PlayerSettings from '@/components/Profile/PlayerSettings.vue';
import type MatchHistory from '@/types/MatchHistory';
import socket from '@/plugin/socketInstance';
import { useToast } from 'vue-toastification';

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const user = ref<User>();
const userStats = ref<Stats>();
const matchsHistory = ref<MatchHistory[]>();
const friends = ref<User[]>();
const error = ref('');
const rightCardTitle = ref('PLAYER STATS');
const partToDisplay = ref('Player Stats');

function setRightCardTitle(displayPart: string) {
	if (displayPart === 'Notifications') rightCardTitle.value = 'NOTIFICTIONS';
	else if (displayPart === 'Settings') rightCardTitle.value = 'SETTINGS';
	else rightCardTitle.value = 'PLAYER STATS';
}

function setPartToDisplay(displayPart: string) {
	partToDisplay.value = displayPart;
	setRightCardTitle(displayPart);
}

function fetchUser() {
	UsersService.getUser(parseInt(route.params.id as string))
		.then((response) => {
			user.value = response.data;
			fetchStats();
			fetchMatchsHistory();
			fetchfriends();
		})
		.catch((e) => {
			if (e.response && e.response.status === 404)
			{
				router.replace({
				name: 'NotFound',
				params: { pathMatch: route.path.substring(1).split('/') },
				});
			}
			else
			{
				if (e.response.data) error.value = e.response.data.message;
				else error.value = "Something went wrong"
				toast.error(error.value);
			}
		});
}

function fetchStats() {
	UsersService.getStats(parseInt(route.params.id as string))
		.then((response) => {
			userStats.value = response.data;
			console.log(userStats.value);
		})
		.catch((e) => {
			if (e.response.data) error.value = e.response.data.message;
			else error.value = "Something went wrong"
			toast.error(error.value);
		});
}

function fetchMatchsHistory() {
	UsersService.getMatchsHistory(parseInt(route.params.id as string))
		.then((response) => {
			matchsHistory.value = response.data;
			console.log(matchsHistory.value);
		})
		.catch((e) => {
			if (e.response.data) error.value = e.response.data.message;
			else error.value = "Something went wrong"
			toast.error(error.value);
		});
}

function fetchfriends() {
	UsersService.getUserfriends(userStore.userData.id)
		.then((response) => {
			friends.value = response.data;
		})
		.catch((e) => {
			if (e.response.data) error.value = e.response.data.message;
			else error.value = "Something went wrong"
			toast.error(error.value);
		});
}

function removeFriend(userId: number) {
	if (friends.value) {
		const index = friends.value.findIndex((element) => element.id === userId);
		if (index !== -1) friends.value.splice(index, 1);
	}
}

function updateStatus(data: User) {
	if (user.value) if (data.id === user.value.id) user.value.status = data.status;
}

watch(
	() => route.params.id,
	() => {
		if (parseInt(route.params.id as string) === userStore.userData.id) user.value = userStore.userData;
	}
);

const isMe = computed(() => {
	return parseInt(route.params.id as string) === userStore.userData.id;
});

const isLoading = computed(() => {
	if (isMe.value) {
		if ((user.value && userStats.value && matchsHistory.value) || error.value) return false;
	} else if ((user.value && userStats.value && matchsHistory.value && friends.value) || error.value) return false;
	return true;
});

onBeforeMount(() => {
	if (isMe.value)
	{
		user.value = userStore.userData;
		fetchStats();
		fetchMatchsHistory();
	}
	else fetchUser();
	socket.on('update_status', (data) => {
		console.log(data);
		updateStatus(data);
	});
});

onBeforeUnmount(() => {
	socket.off('update_status', (data) => {
		updateStatus(data);
	});
});
</script>

<template>
	<base-ui :isLoading="isLoading">
		<div class="flex flex-col h-full w-full sm:flex-row">
			<card-left>
				<div class="flex justify-around items-center h-full pb-2 sm:pb-0 sm:flex-col sm:justify-between">
					<player-profile :user="user"></player-profile>
					<button-part @change-display="setPartToDisplay" @remove-Friend="removeFriend" :friends="friends"></button-part>
					<rank-card :rank="userStats?.rank"></rank-card>
				</div>
			</card-left>
			<card-right :title="rightCardTitle">
				<div v-if="partToDisplay === 'Player Stats'" class="flex flex-col justify-center gap-4 sm:gap-6 h-full w-11/12 px-8 3xl:px-10">
					<player-stats :userStats="userStats"></player-stats>
					<div class="flex justify-center overflow-y-auto w-full">
						<player-history :user="user" :matchsHistory="matchsHistory"></player-history>
					</div>
				</div>
				<div v-else-if="partToDisplay === 'Notifications'" class="flex flex-col justify-center items-center px-10 w-11/12">
					<notifications></notifications>
				</div>
				<div v-else class="w-11/12 h-full mr-3">
					<player-settings></player-settings>
				</div>
			</card-right>
		</div>
	</base-ui>
</template>
