<script setup lang="ts">
import { NotificationType } from '@/types/Notification';
import { useGlobalStore } from '@/stores/globalStore';
import { onUnmounted, computed } from 'vue';
import { useToast } from 'vue-toastification';
import { useRouter, useRoute } from 'vue-router';
import UserService from '@/services/UserService';
import type Notification from '@/types/Notification';

const globalStore = useGlobalStore();
const toast = useToast();
const router = useRouter();
const route = useRoute();

const size = computed(() => {
	return globalStore.notifications.length;
});

function isActionNotification(notification: Notification) {
	return (notification.type == NotificationType.FRIEND_REQUEST || notification.type == NotificationType.MATCH_REQUEST) 
}

function isGameNotification(notification: Notification) {
	return (notification.type == NotificationType.MATCH_REQUEST)
}

function acceptInvitation(notification: Notification) {
	UserService.notificationAction(notification.id, true)
		.then((response) => {
			globalStore.removeNotification(notification.id)
			if (notification.type  == NotificationType.MATCH_REQUEST)
				router.push('match/' + response?.data.id)
			else if(notification.type  == NotificationType.FRIEND_REQUEST)
				globalStore.addFriend(notification.from_user)
		})
		.catch((error) => {
			if (error.response.status === 406)
			{
				toast.warning(error.response.data.message)
				globalStore.removeNotification(notification.id)
			}
			else router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
		})
}

function declineInvitation(notification: Notification) {
	UserService.notificationAction(notification.id, false)
		.then(() => {
			globalStore.removeNotification(notification.id)
			if(notification.type  == NotificationType.FRIEND_REQUEST)
				globalStore.removePendingFriend(notification.from_user_id)
		})
		.catch((error) => {
			if (error.response.status === 406)
			{
				toast.warning(error.response.data.message)
				globalStore.removeNotification(notification.id)
			}
			else router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
		})
}

onUnmounted(() => {
	globalStore.removeNotActionNotification()
	UserService.removeNotActionNotification()
		.catch((error) => {
			router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
		})
});
</script>

<template>
	<div class="flex flex-col items-center justify-center h-full w-full">
		<p class="text-red-200 text-sm pb-3 sm:pb-5">
			You have <span class="text-red-700">{{ size }}</span> notifications
		</p>
		<div class="flex flex-col w-full overflow-y-auto gap-3 pr-4">
			<div v-for="notification in globalStore.notifications" :key="notification.id">
				<p class="text-xs text-red-300">{{ notification.date }}</p>
				<div class="flex justify-between items-center w-full p-4 text-blue-600 bg-neutral-100 border border-blue-600 rounded-lg">
					<div class="flex items-center gap-2">
						<img v-if="isGameNotification(notification)" class=" h-11 w-11 shrink-0 rounded-full border-[1px] border-pink-400 object-cover" src='@/assets/invitationGame.jpg'>
						<div v-else class="flex items-center justify-center border border-blue-600 h-11 w-11 shrink-0 rounded-full">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-suit-heart" viewBox="0 0 16 16"> <path d="m8 6.236-.894-1.789c-.222-.443-.607-1.08-1.152-1.595C5.418 2.345 4.776 2 4 2 2.324 2 1 3.326 1 4.92c0 1.211.554 2.066 1.868 3.37.337.334.721.695 1.146 1.093C5.122 10.423 6.5 11.717 8 13.447c1.5-1.73 2.878-3.024 3.986-4.064.425-.398.81-.76 1.146-1.093C14.446 6.986 15 6.131 15 4.92 15 3.326 13.676 2 12 2c-.777 0-1.418.345-1.954.852-.545.515-.93 1.152-1.152 1.595L8 6.236zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.55 7.55 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z"/> </svg>
						</div>
						<p class="pl-1 text-xs">
							{{ notification.message }}
						</p>
					</div>
					<div v-if="isActionNotification(notification)" class="flex gap-1">
						<button @click="acceptInvitation(notification)" class="bg-blue-600 text-neutral-100 hover:text-neutral-100 p-1">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-2 w-2" viewBox="0 0 20 20" fill="currentColor">
  								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
						</button>
						<button @click="declineInvitation(notification)" class="bg-red-600 text-neutral-100 hover:text-neutral-100 p-1">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-2 w-2" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
