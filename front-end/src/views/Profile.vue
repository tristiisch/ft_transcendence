<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { useGlobalStore } from '@/stores/globalStore';
import { ref, onBeforeMount, watch, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
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

const userStore = useUserStore();
const globalStore = useGlobalStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const user = ref<User>();
const userStats = ref<Stats>();
const matchsHistory = ref<MatchHistory[]>([]);
const isLoading = ref(false)
const rightCardTitle = ref('PLAYER STATS');
const partToDisplay = ref('Player Stats');

const userId = computed(() => {
	return parseInt(route.params.id as string)
})

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
	Promise.all([UsersService.getMatchsHistory(userId.value), UsersService.getStats(userId.value)])
	.then((result) => {
		console.log(result)
		matchsHistory.value = result[0].data
		userStats.value = result[1].data
		isLoading.value = false
	})
	.catch((error) => {
		router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
	})
}

watch(
	() => userId.value,
	() => {
		if (userId.value)
		{
			isLoading.value = true
			if (isMe.value) user.value = userStore.userData;
			else user.value = globalStore.getUser(userId.value)
			fetchAll()
		}
	}
);

const isMe = computed(() => {
	return userId.value === userStore.userData.id;
});

const isLoaded = computed(() => {
	if (!isLoading.value && !globalStore.isLoading && userStore.isLoaded) return true;
	return false;
});

onBeforeMount(() => {
	isLoading.value = true
	if (isMe.value) user.value = userStore.userData;
	else user.value = globalStore.getUser(userId.value)
	if (!user.value) router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: 404 }});
	else fetchAll()
});
</script>

<template>
	<base-ui :isLoaded="isLoaded">
		<div class="flex flex-col h-full w-full sm:flex-row">
			<card-left>
				<div class="flex justify-around items-center h-full pb-2 sm:pb-0 sm:flex-col sm:justify-between">
					<player-profile :user="user"></player-profile>
					<button-part @change-display="setPartToDisplay"></button-part>
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
