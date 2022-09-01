<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { ref, onBeforeMount, watch, computed } from 'vue';
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
const route = useRoute();
const router = useRouter();
const toast = useToast();

const user = ref<User | null>(null);
const userStats = ref<Stats | null>(null)
const matchsHistory = ref<MatchHistory[] | null>(null);
const error = ref('')
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
		})
		.catch((e) => {
			router.replace({
				name: 'NotFound',
				params: { pathMatch: route.path.substring(1).split('/') },
			});
		});
}

function fetchStats() {
	UsersService.getStats(parseInt(route.params.id as string))
		.then((response) => {
			userStats.value = response.data;
			console.log(userStats.value)
		})
		.catch((e) => {
			error.value = ref(e.response.data.message)
			toast.error(error.value);
		});
}

function fetchMatchsHistory() {
	UsersService.getMatchsHistory(parseInt(route.params.id as string))
		.then((response) => {
			matchsHistory.value = response.data;
			console.log(matchsHistory.value)
		})
		.catch((e) => {
			error.value = ref(e.response.data.message)
			toast.error(error.value);
		});
}

watch(
	() => route.params.id,
	() => {
		if (parseInt(route.params.id as string) === userStore.userData.id) user.value = userStore.userData;
	}
)

const isLoading = computed(() => {
	if (user.value && userStats.value && matchsHistory.value || error.value)
		return false;
	return true;
});

onBeforeMount(() => {
	if (parseInt(route.params.id as string) === userStore.userData.id) user.value = userStore.userData;
	else fetchUser();
	fetchStats()
	fetchMatchsHistory()

});
</script>

<template>
	<base-ui :isLoading="isLoading">
		<div class="flex flex-col h-full w-full sm:flex-row">
			<card-left>
				<div class="flex justify-around items-center h-full pb-2 sm:pb-0 sm:flex-col sm:justify-between">
					<player-profile v-if="user" :user="user"></player-profile>
					<button-part @change-display="setPartToDisplay"></button-part>
					<rank-card v-if="userStats" :rank="userStats.rank"></rank-card>
				</div>
			</card-left>
			<card-right :title="rightCardTitle">
				<div v-if="partToDisplay === 'Player Stats'" class="flex flex-col justify-center gap-4 sm:gap-6 h-full w-11/12 px-8 3xl:px-10">
					<player-stats v-if="userStats" :userStats="userStats"></player-stats>
					<div class="flex justify-center overflow-y-auto w-full">
						<player-history v-if="user && matchsHistory" :user="user" :matchsHistory="matchsHistory"></player-history>
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
