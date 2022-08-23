<script setup lang="ts">
import ButtonGradient1 from '@/components/ButtonGradient1.vue';
import UsersService from '@/services/UserService';
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import type User from '@/types/User';

const userStore = useUserStore();
const route = useRoute();
const friends = ref([] as User[]);
const displayPart = ref('Player Stats');

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
		UsersService.sendFriendRequest(userStore.userData.id, parseInt(route.params.id as string)).catch((e) => {
			console.log(e);
		});
	else
		UsersService.removeFriend(userStore.userData.id, parseInt(route.params.id as string))
			.then(() => {
				fetchfriends();
			})
			.catch((e) => {
				console.log(e);
			});
}

const friendButton = computed(() => {
	for (const friend of friends.value) {
			if (friend.id === parseInt(route.params.id as string)) return 'Remove friend';
	}
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

async function fetchfriends() {
	await UsersService.getUserfriends(userStore.userData.id)
		.then((response) => {
			friends.value = response.data;
			console.log(response.data);
		})
		.catch((e: Error) => {
			console.log(e);
		});
}

const emit = defineEmits<{
	(e: 'changeDisplay', displayedPart: string): void;
}>();

onMounted(() => {
	if (parseInt(route.params.id as string) !== userStore.userData.id) fetchfriends();
});
</script>

<template>
	<div v-if="!isUser()" class="flex flex-col gap-4">
		<button-gradient1 @click="treatFriendRequest()">
			{{ friendButton }}
		</button-gradient1>
		<button-gradient1> Block </button-gradient1>
	</div>
	<div v-else class="flex flex-col gap-4">
		<button-gradient1 @click="setDisplayedPart(1)">
			{{ button1Name }}
		</button-gradient1>
		<button-gradient1 @click="setDisplayedPart(2)">
			{{ button2Name }}
		</button-gradient1>
	</div>
</template>
