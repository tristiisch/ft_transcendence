import { io } from "socket.io-client";
import { useGlobalStore } from '@/stores/globalStore';
import { useUserStore } from '@/stores/userStore';
import type Notification from '@/types/Notification';
import { useToast } from 'vue-toastification';
import { NotificationType } from '@/types/Notification';
import { useChatStore } from '@/stores/chatStore';
import router from '@/router/index'
import Status from '@/types/Status';
import ButtonToast from "@/components/Button/ButtonToast.vue";

const socket = io(`${window.location.protocol}//${window.location.hostname}:${import.meta.env.VITE_API_PORT}`, {
	auth: {token: null},
	autoConnect: false
});

socket.on("connect", () => {

	const globalStore = useGlobalStore();
	const userStore = useUserStore();
	const toast = useToast();
	const chatStore = useChatStore();

	socket.on('addNotification', (notification: Notification) => {
		if (notification.type == NotificationType.MATCH_ACCEPT) {
			globalStore.gameInvitation = true
			chatStore.removeSpinner(userStore.userData.id, notification.from_user_id)
			if (userStore.userData.status !== Status.INGAME) {
				toast.info({
					component: ButtonToast,
					props:  {
						notification: notification
					}})
				setTimeout(() => router.push({ name: 'Match', params: { uuid: notification.match_uuid } }), 5000);
			}
		}
		else if (notification.type == NotificationType.FRIEND_CANCEL) globalStore.removeNotifCancel(notification, NotificationType.FRIEND_REQUEST);
		else {
			globalStore.addNotification(notification);
			if (notification.type == NotificationType.MATCH_CANCEL) {
				globalStore.removeNotifCancel(notification, NotificationType.MATCH_REQUEST);
				chatStore.removeSpinner(notification.from_user_id, notification.from_user_id)
			}
			else if (notification.type == NotificationType.MATCH_DECLINE) {
				globalStore.invitedUser = undefined
				chatStore.removeSpinner(userStore.userData.id, notification.from_user_id)
			}
			else if (notification.type == NotificationType.FRIEND_REQUEST) globalStore.addPendingFriend(notification.from_user)
			else if (notification.type == NotificationType.FRIEND_ACCEPT) globalStore.addFriend(notification.from_user)
			else if (notification.type == NotificationType.FRIEND_DECLINE) globalStore.removePendingFriend(notification.from_user.id)
			else if (notification.type == NotificationType.FRIEND_REMOVE) globalStore.removeFriend(notification.from_user.id)
			toast.info(notification.message)
		}
	})
})

socket.on("double_connection", () => {
	const userStore = useUserStore();
	const toast = useToast();
	toast.error('You are connected from an other window.', {
		timeout: false
	})
	userStore.handleLogout()
})

socket.on("disconnect", () => {
	socket.off('addNotification');
})

export default socket;