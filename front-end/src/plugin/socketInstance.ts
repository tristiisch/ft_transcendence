import { io } from "socket.io-client";
import { useGlobalStore } from '@/stores/globalStore';
import { useUserStore } from '@/stores/userStore';
import type Notification from '@/types/Notification';
import { useToast } from 'vue-toastification';
import { NotificationType } from '@/types/Notification';
import router from '@/router/index'
import Status from '@/types/Status';
import ButtonToast from "@/components/Button/ButtonToast.vue";

const socket = io(`${window.location.protocol}//${window.location.hostname}:${import.meta.env.VITE_API_PORT}`, {
	auth: {token: null},
	autoConnect: false
});

socket.on("connect", () => {

	console.log(socket.id)
	const globalStore = useGlobalStore();
	const userStore = useUserStore();
	const toast = useToast();

	socket.on('addNotification', (notification: Notification) => {
		if (notification.type == NotificationType.MATCH_ACCEPT) {
			globalStore.gameInvitation = true
			if (userStore.userData.status !== Status.INGAME) {
				toast.info({
					component: ButtonToast,
					props:  {
						notification: notification
					}})
				setTimeout(() => router.push({ name: 'Match', params: { uuid: notification.match_uuid } }), 5000);
			}
		}
		else {
			globalStore.addNotification(notification);
			if (notification.type == NotificationType.FRIEND_REQUEST) globalStore.addPendingFriend(notification.from_user)
			else if (notification.type == NotificationType.FRIEND_ACCEPT) globalStore.addFriend(notification.from_user)
			else if (notification.type == NotificationType.FRIEND_DECLINE) globalStore.removePendingFriend(notification.from_user.id)
			else if (notification.type == NotificationType.FRIEND_REMOVE) globalStore.removeFriend(notification.from_user.id)
			else if (notification.type == NotificationType.MATCH_DECLINE) globalStore.invitedUser = undefined
			if (userStore.userData.status !== Status.INGAME) toast.info(notification.message)
		}
	})
})

export default socket;