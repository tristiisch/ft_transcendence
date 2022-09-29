<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { ref, onBeforeMount, watch, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { UserStatus } from '@/types/User';
import UsersService from '@/services/UserService';
import type User from '@/types/User';
import type Stats from '@/types/Stats';
import type MatchHistory from '@/types/MatchHistory';
import PlayerHistory from '@/components/Profile/PlayerHistory.vue';
import PlayerStats from '@/components/Profile/PlayerStats.vue';
import RankCard from '@/components/Profile/RankCard.vue';
import PlayerProfile from '@/components/Profile/PlayerProfile.vue';
import ButtonPart from '@/components/Profile/ButtonPart.vue';
import Notifications from '@/components/Profile/Notifications.vue';
import PlayerSettings from '@/components/Profile/PlayerSettings.vue';
import socket from '@/plugin/socketInstance';

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

const user = ref<User>();
const userStats = ref<Stats>();
const matchsHistory = ref<MatchHistory[]>();
const isLoading = ref(false)
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

function fetchAll() {
	isLoading.value = true
	Promise.all([UsersService.getUser(userId.value), UsersService.getMatchsHistory(userId.value), UsersService.getStats(userId.value)])
	.then((result) => {
		user.value = result[0].data
		matchsHistory.value = result[1].data
		userStats.value = result[2].data
		isLoading.value = false
	})
	.catch((error) => {
		router.replace({
			name: 'Error',
			params: { pathMatch: route.path.substring(1).split('/') },
			query: { code: error.response?.status, message: error.response?.data?.message }
		});
	})
}

function fetchMyStats() {
	isLoading.value = true
	Promise.all([UsersService.getMatchsHistory(userId.value), UsersService.getStats(userId.value)])
	.then((result) => {
		matchsHistory.value = result[0].data
		userStats.value = result[1].data
		isLoading.value = false
	})
	.catch((error) => {
		router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
	})
}

const userId = computed(() => {
	return parseInt(route.params.id as string)
})

const isMe = computed(() => {
	return userId.value === userStore.userData.id;
});

function treatAll() {
	if (isMe.value)
	{
		user.value = userStore.userData;
		fetchMyStats()
	}
	else fetchAll()
	if (route.query.notification)
	{
		partToDisplay.value = 'Notifications'
		rightCardTitle.value = 'NOTIFICTIONS'
	}
}

watch(
	() => userId.value, () => {
		if (userId.value) treatAll()
	}
);

function updateStatus(data: UserStatus) {
	if (user.value?.id === data.id) user.value.status = data.status
}

onBeforeMount(() => {
	treatAll()
	socket.on('updateUserStatus', updateStatus);
});

onBeforeUnmount(() => {
	socket.off('updateUserStatus', updateStatus);
})
</script>

<template>
	<base-ui :isLoading="isLoading">
		<div class="flex flex-col h-full w-full sm:flex-row">
			<card-left>
				<div class="flex justify-around items-center h-full pb-2 sm:pb-0 sm:flex-col sm:justify-between">
					<div class="flex sm:flex-col justify-around sm:justify-center items-center w-full h-full gap-6 3xl:gap-10">
						<player-profile :user="user"></player-profile>
						<button-part @change-display="setPartToDisplay"></button-part>
					</div>
					<rank-card :rank="userStats?.rank" class="mr-6 sm:mr-0"></rank-card>
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
