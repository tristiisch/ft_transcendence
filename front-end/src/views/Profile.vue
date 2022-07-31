<script setup lang="ts">
import UsersService from '@/services/UserService';
import type User from '@/types/User';
import { useUserStore } from '@/stores/userStore';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import PlayerHistory from '@/components/Profile/PlayerHistory.vue';
import CardRight from '@/components/CardRight.vue';
import PlayerStats from '@/components/Profile/PlayerStats.vue';
import CardLeft from '@/components/CardLeft.vue';
import RankCard from '@/components/Profile/RankCard.vue';
import PlayerProfile from '@/components/Profile/PlayerProfile.vue';
import ButtonPart from '@/components/Profile/ButtonPart.vue';

const userStore = useUserStore();
const route = useRoute();
const user = ref({} as User);
const rightCardTitle = ref('PLAYER STATS');
const partToDisplay = ref('Player Stats');

function setRightCardTitle(displayPart:string) {
	if (displayPart === 'Notifications')
		rightCardTitle.value = 'NOTIFICTIONS'
	else if (displayPart === '2Fa')
		rightCardTitle.value = '2Fa'
	else
		rightCardTitle.value = 'PLAYER STATS'
}

function setPartToDisplay(displayPart:string) {
	partToDisplay.value = displayPart;
	setRightCardTitle(displayPart)
}

async function fetchUser(name: string) {
	return await UsersService.getUserInfo(route.params.username as string)
		.then((response) => {
			user.value = response.data;
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

onMounted(() => {
	fetchUser(route.params.username as string);
});

</script>

<template>
	<base-ui>
		<div class="flex flex-col h-full w-full sm:flex-row">
			<card-left>
				<div class="flex justify-around items-center h-full pb-2 sm:flex-col sm:justify-around">
					<player-profile :user="user"></player-profile>
					<button-part @change-display='setPartToDisplay'></button-part>
					<rank-card :rank="user.rank"></rank-card>
				</div>
			</card-left>
			<card-right :title=rightCardTitle>
				<div v-if="partToDisplay === 'Player Stats'" class="flex flex-col justify-around items-center w-full">
					<div class="w-4/5">
						<player-stats :user="user"></player-stats>
					</div>
					<div class="w-4/5">
						<player-history></player-history>
					</div>
				</div>
				<div v-else-if="partToDisplay === 'Notifications'" class="flex flex-col justify-around items-center w-full"></div>
				<div v-else class="flex flex-col justify-around items-center w-full"></div>
			</card-right>
		</div>
	</base-ui>
</template>
