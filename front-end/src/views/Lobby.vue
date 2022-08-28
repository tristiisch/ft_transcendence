<script setup lang="ts">
import UsersService from '@/services/UserService';
import type Match from '@/types/Match';
import { ref, onBeforeMount, computed } from 'vue';
import CardLeft from '@/components/CardLeft.vue';
import CardRight from '@/components/CardRight.vue';
import CurrentGame from '@/components/Lobby/CurrentGame.vue';
import AddSearchPlayer from '@/components/Chat/AddSearchPlayer.vue';
import GameSettings from '@/components/Lobby/GameSettings.vue';
import ButtonReturnNext from '@/components/Chat/ButtonReturnNext.vue';
import SelectPlayer from '@/components/Lobby/SelectPlayer.vue'
import { useToast } from 'vue-toastification';

const toast = useToast();
const matchs = ref<Match[] | null>(null);
const error = ref('')
const rightPartToDisplay = ref('gameSettings');
const invitation = ref(false)

function setRightPartToDisplay()
{
	if (rightPartToDisplay.value === 'selectPlayer')
		rightPartToDisplay.value = 'gameSettings'
	else
		rightPartToDisplay.value = 'selectPlayer'

}

async function fetchCurrentMatchs() {
	return await UsersService.getCurrentMatchs()
		.then((response) => {
			matchs.value = response.data;
		})
		.catch((e) => {
			error.value = e.response.data.message
			toast.error(error.value);
		});
}

function side()
{
	if (rightPartToDisplay.value === 'gameSettings')
		return 'next'
	else
		return 'previous'
}

function invitePlayer()
{
	rightPartToDisplay.value = 'selectPlayer'
	invitation.value = true

}

const isLoading = computed(() => {
	if (matchs.value || error.value)
		return false;
	return true;
});

onBeforeMount(() => {
	fetchCurrentMatchs();
});
</script>


<template>
	<base-ui :isLoading="isLoading">
		<div class="flex flex-col h-full sm:flex-row">
			<card-left>
				<div class="flex justify-between items-center h-full flex-wrap sm:flex-col sm:flex-nowrap px-6">
					<h1 class="w-full text-center font-Arlon tracking-tight text-lg sm:text-xl pb-2 sm:pb-5 border-b-[1px] border-slate-700 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">CURRENT GAMES</h1>
					<current-game @next="rightPartToDisplay = 'invitePlayer'" v-if="matchs" :matchs="matchs"></current-game>
				</div>
			</card-left>
			<card-right title="CUSTOM GAME">
				<div class="flex flex-col justify-between items-center w-11/12 h-full px-8">
					<div class="flex flex-col justify-center items-center w-full h-full">
						<game-settings v-if="rightPartToDisplay === 'gameSettings'" @next="rightPartToDisplay = 'selectPlayer'"></game-settings>
						<select-player v-else-if="rightPartToDisplay === 'selectPlayer'" @invitePlayer="rightPartToDisplay = 'invitePlayer'" :invitation="invitation"></select-player>
						<add-search-player v-if="rightPartToDisplay === 'invitePlayer'" @validate="invitePlayer()" @close="rightPartToDisplay = 'selectPlayer'"></add-search-player>
					</div>
					<button-return-next v-if="rightPartToDisplay != 'invitePlayer'" @click="setRightPartToDisplay()" :side="side()" class="self-end mt-2"></button-return-next>
				</div>
			</card-right>
		</div>
	</base-ui>
</template>
