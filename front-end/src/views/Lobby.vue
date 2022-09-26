<script setup lang="ts">
import { ref, onBeforeMount, onBeforeUnmount } from 'vue';
import { useGlobalStore } from '@/stores/globalStore';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import UsersService from '@/services/UserService';
import type Match from '@/types/Match';
import type User from '@/types/User';
import CurrentGame from '@/components/Lobby/CurrentGame.vue';
import UsersSearch from '@/components/Divers/UsersChannelsSearch.vue';
import SelectWorld from '@/components/Lobby/SelectWorld.vue'
import GameSettings from '@/components/Lobby/GameSettings.vue';
import ButtonReturnNext from '@/components/Button/ButtonReturnNext.vue';
import SelectPlayer from '@/components/Lobby/SelectPlayer.vue'
import ButtonCloseValidate from '@/components/Button/ButtonCloseValidate.vue'
import socket from '@/plugin/socketInstance';
import UserService from '@/services/UserService';

const globalStore = useGlobalStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const matchs = ref([] as Match[]);
const isLoading = ref(false);
const rightPartToDisplay = ref('gameSettings');
const invitation = ref(false);

function setRightPartToDisplay()
{
	if (rightPartToDisplay.value === 'gameSettings')
		rightPartToDisplay.value = 'selectWorld'
	else if (rightPartToDisplay.value === 'selectWorld')
		rightPartToDisplay.value = 'selectPlayer'
}

function fetchCurrentMatchs() {
	isLoading.value = true
	UsersService.getCurrentMatchs()
		.then((response) => {
			matchs.value = response.data;
			console.log(matchs.value)
			isLoading.value = false
		})
		.catch((error) => {
			router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status } });
		});
}

function invitePlayer()
{
	rightPartToDisplay.value = 'selectPlayer'
	invitation.value = true
    if (globalStore.isTypeUser(globalStore.selectedItems[0])) {
        globalStore.invitedUser = globalStore.selectedItems[0];
        globalStore.resetSelectedItems();
    }
	console.log(globalStore.invitedUser)
	if (globalStore.invitedUser)
	{
		UserService.sendGameRequest(globalStore.invitedUser.id, {
			ballSpeed: globalStore.ballSpeed,
			racketSize: globalStore.racketSize,
			increaseBallSpeed: globalStore.increaseSpeed,
			world: globalStore.world,
			neededPointsForVictory: globalStore.neededPointsForVictory
		})
		.then((response) => {
			if (response.data.message) toast.info(response.data.message)
		})
		.catch((error) => {
			invitation.value = false
			globalStore.invitedUser = undefined
			if (error.response.status === 400) toast.warning(error.response.data.message)
			else router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status } });
		})
	}
}

function unsetInvitedUser() {
	rightPartToDisplay.value = 'selectWorld'
	globalStore.invitedUser = undefined
	invitation.value = false
}

function updateMatch(match: Match) {
	const index = matchs.value.findIndex((user) => user.id === match.id);
	if (index !== -1) matchs.value[index].score = match.score;
}

socket.on('gameInvitation', (gameId: number) => {
	router.push('match/' + gameId)
});

function onClose() {
	rightPartToDisplay.value = 'selectPlayer';
	if (globalStore.selectedItems[0])
		globalStore.resetSelectedItems();
}

onBeforeMount(() => {
	//fetchCurrentMatchs();
	socket.on('UpdateMatch', updateMatch);
	globalStore.ballSpeed = 100;
	globalStore.racketSize = 100;
	globalStore.world = 1;
	globalStore.neededPointsForVictory = 5;
	if (globalStore.invitedUser)
	{
		rightPartToDisplay.value = 'selectPlayer';
		invitation.value = true
	}
});

onBeforeUnmount(() => {
	socket.off('UpdateMatch', updateMatch);
	socket.off('gameInvitation')
});
</script>


<template>
	<base-ui :isLoading="isLoading">
		<div class="flex flex-col h-full sm:flex-row">
			<card-left>
				<div class="flex flex-col justify-between items-center h-full px-6 lg:px-8">
					<h1 class="w-full text-center font-Arlon tracking-tight text-lg sm:text-xl pb-2 sm:pb-5 border-b-[1px] border-slate-700 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">CURRENT GAMES</h1>
					<current-game @next="rightPartToDisplay = 'invitePlayer'" v-if="matchs" :matchs="matchs"></current-game>
				</div>
			</card-left>
			<card-right title="CUSTOM GAME">
				<div class="flex flex-col justify-between items-center w-11/12 h-full px-8">
					<game-settings v-if="rightPartToDisplay === 'gameSettings'" @next="rightPartToDisplay = 'selectWorld'"></game-settings>
					<select-world v-if="rightPartToDisplay === 'selectWorld'"  @next="rightPartToDisplay = 'selectPlayer'"></select-world>
					<div v-if="(rightPartToDisplay === 'gameSettings') || (rightPartToDisplay === 'selectWorld')" class="flex self-end gap-3">
						<button-return-next v-if="rightPartToDisplay === 'selectWorld'" @click="rightPartToDisplay = 'gameSettings'" side="previous" class="mb-1"></button-return-next>
						<button-return-next  @click="setRightPartToDisplay()" side="next" class="mb-1"></button-return-next>
					</div>
					<select-player v-else-if="rightPartToDisplay === 'selectPlayer'" @return="unsetInvitedUser()" @invitePlayer="rightPartToDisplay = 'invitePlayer'" :invitation="invitation"></select-player>
					<users-search v-if="rightPartToDisplay === 'invitePlayer'" :singleSelection="true" :type="'users'"></users-search>
					<button-close-validate v-if="rightPartToDisplay === 'invitePlayer'" @validate="invitePlayer()" @close="onClose()"></button-close-validate>
				</div>
			</card-right>
		</div>
	</base-ui>
</template>
