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
import QRCode from '@/components/Profile/QRCode.vue';
import Notifications from '@/components/Profile/Notifications.vue';
import ButtonGradient1 from '../components/ButtonGradient1.vue';

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
				<div v-else class="flex flex-col items-center w-full overflow-y-auto h-full gap-5">
					<h1 class="text-center text-red-200 sm:text-xl mx-6 w-3/4 md:text-xl py-3 border-b-[1px] border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500">
							Activation 2FA
					</h1>
					<q-r-code></q-r-code>
					<h1 class="text-center text-red-200 sm:text-xl mx-6 w-3/4 md:text-xl py-3 border-b-[1px] border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500">
							Edit Profile
					</h1>
					<div class="w-full px-10">
						<h2 class="text-left mb-4 text-red-800 text-lg">Change Username:</h2>
						<div class="flex items-center w-full gap-2 mb-4">
							<p>Username:</p>
							<form class="w-full">
								<input
									class="placeholder-red-200 w-full bg-red-400 text-center font-medium text-xs py-1 px-3 sm:px-5 md:text-sm md:px-8"
									type="text"
									name="username"
									v-model.trim="username"
									placeholder="Username"
								/>
							</form>
						</div>
						<h2 class="text-left mb-4 text-red-800 text-lg">Change Avatar:</h2>
						<div class="flex items-center gap-2">
							<input class="block mb-5 w-full text-sm cursor-pointer focus:outline-none text-red-300 file:py-1 file:text-sm file:bg-red-700 file:border-0 file:text-red-200" type="file">
						</div>
					</div>
					<base-button class="self-end mr-6 bg-blue-600 py-1 px-5 text-white">Save</base-button>
					<h1 class="text-center text-red-200 sm:text-xl mx-6 w-3/4 md:text-xl py-3 border-b-[1px] border-red-500 bg-gradient-to-r from-red-500 via-red-600 to-red-500">
							Remove Profile
					</h1>
					<base-button class="mr-6 bg-blue-600 py-1 px-5 text-white">Delete</base-button>
				</div>
			</card-right>
		</div>
	</base-ui>
</template>
