<script setup lang="ts">
import { useToast } from 'vue-toastification';
import { ref, onBeforeMount, computed } from 'vue';
import { useGlobalStore } from '@/stores/globalStore';
import { useUserStore } from '@/stores/userStore';
import { useRoute, useRouter } from 'vue-router';
import UsersService from '@/services/UserService';
import type Match from '@/types/Match';
import type User from '@/types/User';
import CurrentGame from '@/components/Lobby/CurrentGame.vue';
import UsersSearch from '@/components/Divers/UsersChannelsSearch.vue';
import GameSettings from '@/components/Lobby/GameSettings.vue';
import ButtonReturnNext from '@/components/Button/ButtonReturnNext.vue';
import SelectPlayer from '@/components/Lobby/SelectPlayer.vue'
import ButtonCloseValidate from '@/components/Button/ButtonCloseValidate.vue'

const globalStore = useGlobalStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const matchs = ref<Match[] | null>(null);
const rightPartToDisplay = ref('gameSettings');
const invitation = ref(false);
const invitedUser = ref<User | undefined>();

function setRightPartToDisplay()
{
	if (rightPartToDisplay.value === 'selectPlayer')
		rightPartToDisplay.value = 'gameSettings'
	else
		rightPartToDisplay.value = 'selectPlayer'

}

function fetchCurrentMatchs() {
	UsersService.getCurrentMatchs()
		.then((response) => {
			matchs.value = response.data;
		})
		.catch((error) => {
			router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status } });
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
    if (globalStore.isTypeUser(globalStore.selectedItems[0])) {
        invitedUser.value = globalStore.selectedItems[0];
        globalStore.resetSelectedItems();
    }
}

const isLoaded = computed(() => {
	if (matchs.value && userStore.isLoaded) return true;
	return false;
});

onBeforeMount(() => {
	fetchCurrentMatchs();
});
</script>


<template>
	<base-ui :isLoaded="isLoaded">
		<div class="flex flex-col h-full sm:flex-row">
			<card-left>
				<div class="flex justify-between items-center h-full flex-wrap sm:flex-col sm:flex-nowrap px-6">
					<h1 class="w-full text-center font-Arlon tracking-tight text-lg sm:text-xl pb-2 sm:pb-5 border-b-[1px] border-slate-700 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">CURRENT GAMES</h1>
					<current-game @next="rightPartToDisplay = 'invitePlayer'" v-if="matchs" :matchs="matchs"></current-game>
				</div>
			</card-left>
			<card-right title="CUSTOM GAME">
				<div class="flex flex-col justify-between items-center w-11/12 h-full px-8">
					<game-settings v-if="rightPartToDisplay === 'gameSettings'" @next="rightPartToDisplay = 'selectPlayer'"></game-settings>
					<select-player v-else-if="rightPartToDisplay === 'selectPlayer'" @invitePlayer="rightPartToDisplay = 'invitePlayer'" :invitation="invitation" :invitedUser="invitedUser"></select-player>
					<users-search v-if="rightPartToDisplay === 'invitePlayer'" :singleSelection="true" :type="'users'"></users-search>
					<button-return-next v-if="rightPartToDisplay != 'invitePlayer'" @click="setRightPartToDisplay()" :side="side()" class="self-end mt-2"></button-return-next>
					<button-close-validate v-else @validate="invitePlayer()" @close="rightPartToDisplay = 'selectPlayer'"></button-close-validate>
				</div>
			</card-right>
		</div>
	</base-ui>
</template>
