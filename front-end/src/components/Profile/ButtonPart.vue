<script setup lang="ts">
import { computed, ref, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useGlobalStore } from '@/stores/globalStore';
import UsersService from '@/services/UserService';
import ButtonGradient from '@/components/Button/ButtonGradient.vue';
import { useToast } from 'vue-toastification';

const userStore = useUserStore();
const globalStore = useGlobalStore();
const route = useRoute();
const router = useRouter();
const displayPart = ref('Player Stats');
const toast = useToast();

const emit = defineEmits<{
	(e: 'changeDisplay', displayedPart: string): void;
}>();

const userId = computed(() => {
	return parseInt(route.params.id as string)
})

const isUser = computed(() =>  {
	if (userId.value === userStore.userData.id) return true;
	return false;
})

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
	if (friendButton.value !== 'Pending')
	{
		if (!globalStore.isFriend(userId.value)) {
			UsersService.sendFriendRequest(userId.value)
				.then((response) => {
					globalStore.addPendingFriend(response.data.user.id)
					toast.info(response.data.message)
				})
				.catch((error) => {
					router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
				});
		}
		else {
			UsersService.removeFriend(userId.value)
				.then((response) => {
					globalStore.removeFriend(response.data.user.id)
					toast.info(response.data.message)
				})
				.catch((error) => {
					router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
				});
		}
	}
}

const friendButton = computed(() => {
	if (globalStore.isFriend(userId.value)) return 'Remove friend';
	else if (globalStore.isPendingFriend(userId.value)) return 'Pending';
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

onBeforeMount(() => {
	if (route.query.notification)
		displayPart.value = 'Notifications'
});
</script>

<template>
	<div v-if="!isUser" class="flex flex-col gap-4">
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
