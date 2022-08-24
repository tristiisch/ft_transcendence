<script setup lang="ts">
import UserService from '@/services/UserService';
import type User from '@/types/User';
import { useUserStore } from '@/stores/userStore';
import { ref, onBeforeMount, watch } from 'vue';
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

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

const user = ref({} as User);
const isLoading = ref(false);
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

function fetchUser(id: number) {
	isLoading.value = true;
	UserService.getUser(id)
		.then((response) => {
			user.value = response.data;
			isLoading.value = false;
		})
		.catch((e) => {
			router.replace({
				name: 'NotFound',
				params: { pathMatch: route.path.substring(1).split('/') },
			});
		});
}

watch(
	() => route.params.id,
	() => {
		if (parseInt(route.params.id as string) === userStore.userData.id) user.value = userStore.userData;
	}
)

onBeforeMount(() => {
	if (parseInt(route.params.id as string) === userStore.userData.id) user.value = userStore.userData;
	else fetchUser(parseInt(route.params.id as string));
});
</script>

<template>
	<base-ui :isLoading="isLoading">
		<div class="flex flex-col h-full w-full sm:flex-row">
			<card-left>
				<div class="flex justify-around items-center h-full pb-2 sm:pb-0 sm:flex-col sm:justify-between">
					<player-profile :user="user"></player-profile>
					<button-part @change-display="setPartToDisplay"></button-part>
					<rank-card :rank="user.rank"></rank-card>
				</div>
			</card-left>
			<card-right :title="rightCardTitle">
				<div v-if="partToDisplay === 'Player Stats'" class="flex flex-col justify-center gap-4 sm:gap-6 h-full w-11/12 px-8 3xl:px-10">
					<player-stats :user="user"></player-stats>
					<div class="flex justify-center overflow-y-auto w-full">
						<player-history :user="user"></player-history>
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
