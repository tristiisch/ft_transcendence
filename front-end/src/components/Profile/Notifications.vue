<script setup lang="ts">
import UsersService from '@/services/UserService';
import type Notification from '@/types/Notification';
import { NotificationType } from '@/types/Notification';
import { ref, onBeforeMount, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useToast } from 'vue-toastification';

const notifications = ref<Notification[] | null>(null);
const isLoading = ref(false);
const userStore = useUserStore();
const toast = useToast();

function fetchNotifications() {
	isLoading.value = true;
	UsersService.getNotifications(userStore.userData.username)
		.then((response) => {
			notifications.value = response.data;
			isLoading.value = false;
		})
		.catch((e: Error) => {
			isLoading.value = false;
			toast.error(e);
		});
}

const size = computed(() => {
	if (notifications.value) return notifications.value.length;
	else return 0;
});

function acceptInvitation(notification: Notification) {
	console.log('accept');
	if (notification.Request === NotificationType.FRIEND_REQUEST)
	{
		UsersService.acceptFriendRequest(userStore.userData.id, notification.from)
		.then(() => {
			if (notifications.value) {
				for (let i = 0; i < notifications.value.length; i++) {
					if (notifications.value[i].date === notification.date) notifications.value.splice(i, 1);
				}
			}
		})
		.catch((e: Error) => {
			toast.error(e);
		});
	}
}

function declineInvitation(notification: Notification) {
	console.log('decline');
	if (notification.Request === NotificationType.FRIEND_REQUEST)
	{
		UsersService.declineFriendRequest(userStore.userData.id, notification.from)
		.then(() => {
			if (notifications.value) {
				for (let i = 0; i < notifications.value.length; i++) {
					if (notifications.value[i].date === notification.date) notifications.value.splice(i, 1);
				}
			}
		})
		.catch((e: Error) => {
			toast.error(e);
		});
	}
}

onBeforeMount(() => {
	fetchNotifications();
});
</script>

<template>
	<div v-if="isLoading" class="flex items-center justify-center h-full font-Arlon text-white text-6xl">Loading</div>
	<div v-else class="flex flex-col items-center justify-center pb-3 sm:px-3 sm:pt-3 h-full w-full">
		<p class="text-red-200 text-sm pb-3 sm:pb-5">
			You have <span class="text-lime-400">{{ size }}</span> notifications
		</p>
		<div class="w-full overflow-y-auto">
			<div v-for="notification in notifications" :key="notification.date" class="flex flex-col w-full text-red-100">
				<p class="text-xs text-red-200">{{ notification.date }}</p>
				<div class="flex justify-between items-center w-full p-2.5 mb-3 sm:mb-5 text-red-100 bg-blue-600 rounded">
					<p class="pl-3 text-xs text-white">
						Friend request from {{ notification.from }}
					</p>
					<div class="flex gap-1">
						<button @click="acceptInvitation(notification)" class="bg-blue-500 text-green-200 hover:text-white rounded-md focus:ring-2 focus:ring-gray-300 p-1 inline-flex h-4 w-4">
							<svg class="w-2 h-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								></path>
							</svg>
						</button>
						<button @click="declineInvitation(notification)" class="bg-red-600 text-red-200 hover:text-white rounded-md focus:ring-2 focus:ring-gray-300 p-1 inline-flex h-4 w-4">
							<svg class="w-2 h-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
								<path
									fill-rule="evenodd"
									d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
									clip-rule="evenodd"
								></path>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
