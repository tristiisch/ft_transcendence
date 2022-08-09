<script setup lang="ts">
import UsersService from '@/services/UserService';
import type User from '@/types/User';
import { useUserStore } from '@/stores/userStore';
import { ref, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
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
const user = ref({} as User);
const rightCardTitle = ref('PLAYER STATS');
const partToDisplay = ref('Player Stats');

function setRightCardTitle(displayPart: string) {
	if (displayPart === 'Notifications') rightCardTitle.value = 'NOTIFICTIONS';
	else if (displayPart === 'Setting') rightCardTitle.value = 'SETTINGS';
	else rightCardTitle.value = 'PLAYER STATS';
}

function setPartToDisplay(displayPart: string) {
	partToDisplay.value = displayPart;
	setRightCardTitle(displayPart);
}

function fetchUser(name: string) {
	UsersService.getUser(route.params.username as string)
		.then((response) => {
			user.value = response.data;
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

onBeforeMount(() => {
	if ((route.params.username as string) === userStore.userData.username) user.value = userStore.userData;
	else fetchUser(route.params.username as string);
});

</script>

<template>
	<base-ui>
		<div class="flex flex-col h-full w-full sm:flex-row">
			<card-left>
				<div class="flex justify-around items-center h-full pb-2 sm:pb-0 sm:flex-col sm:justify-between">
					<player-profile :user="user"></player-profile>
					<button-part @change-display="setPartToDisplay"></button-part>
					<rank-card :rank="user.rank"></rank-card>
				</div>
			</card-left>
			<card-right :title="rightCardTitle">
				<div v-if="partToDisplay === 'Player Stats'" class="flex flex-col justify-around items-center w-full">
					<div class="w-4/5">
						<player-stats :user="user"></player-stats>
					</div>
					<div class="w-4/5">
						<player-history></player-history>
					</div>
				</div>
				<div v-else-if="partToDisplay === 'Notifications'" class="flex flex-col justify-center items-center px-10 w-full">
					<notifications></notifications>
				</div>
				<div v-else class="flex flex-col items-center w-full overflow-y-auto h-full gap-5 mr-2">
					<player-settings></player-settings>
				</div>
			</card-right>
		</div>
	</base-ui>
</template>
