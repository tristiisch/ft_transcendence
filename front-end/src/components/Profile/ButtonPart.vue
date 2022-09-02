<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import UsersService from '@/services/UserService';
import ButtonGradient from '@/components/Button/ButtonGradient.vue';

import type User from '@/types/User';

const userStore = useUserStore();
const route = useRoute();
const pending = ref(false);
const displayPart = ref('Player Stats');

const emit = defineEmits<{
	(e: 'changeDisplay', displayedPart: string): void;
	(e: 'removeFriend', userId: number): void;
}>();

const props = defineProps<{ friends?: User[] }>();

function isUser() {
	if (parseInt(route.params.id as string) === userStore.userData.id) return true;
	return false;
}

function setDisplayedPart(button: number) {
	if (button === 1)
		if (displayPart.value === 'Player Stats') displayPart.value = 'Notifications';
		else displayPart.value = 'Player Stats';
	else if (displayPart.value === 'Player Stats') displayPart.value = 'Settings';
	else if (displayPart.value === 'Settings') displayPart.value = 'Notifications';
	else displayPart.value = 'Settings';
	emit('changeDisplay', displayPart.value);
}

function treatFriendRequest() {
	if (friendButton.value === 'Add friend')
		UsersService.sendFriendRequest(parseInt(route.params.id as string))
			.then(() => {
				pending.value = true;
			})
			.catch((e) => {
				console.log(e);
			});
	else if (friendButton.value === 'Remove friend')
		UsersService.removeFriend(parseInt(route.params.id as string))
			.then(() => {
				emit('removeFriend', parseInt(route.params.id as string));
			})
			.catch((e) => {
				console.log(e);
			});
}

const friendButton = computed(() => {
	if (props.friends) {
		for (const friend of props.friends) {
			if (friend.id === parseInt(route.params.id as string)) return 'Remove friend';
		}
	}
	if (pending.value === true) return 'Pending';
	return 'Add friend';
});

const button1Name = computed(() => {
	if (displayPart.value === 'Notifications' || displayPart.value === 'Settings') return 'Player Stats';
	else return 'Notifications';
});

const button2Name = computed(() => {
	if (displayPart.value === 'Settings') return 'Notifications';
	else return 'Settings';
});
</script>

<template>
	<div v-if="!isUser()" class="flex flex-col gap-4">
		<button-gradient @click="treatFriendRequest()">
			{{ friendButton }}
		</button-gradient>
		<button-gradient> Block </button-gradient>
	</div>
	<div v-else class="flex flex-col gap-4">
		<button-gradient @click="setDisplayedPart(1)">
			{{ button1Name }}
		</button-gradient>
		<button-gradient @click="setDisplayedPart(2)">
			{{ button2Name }}
		</button-gradient>
	</div>
</template>
