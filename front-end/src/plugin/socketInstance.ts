import { io } from "socket.io-client";
import { useGlobalStore } from '@/stores/globalStore';
import type Notification from '@/types/Notification';
import type User from '@/types/User';
import { useToast } from 'vue-toastification';
import { NotificationType } from '@/types/Notification';
import type LeaderboardUser from '@/types/Leaderboard';
import type { UserStatus } from '@/types/User';

const URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(URL, {
	auth: {token: null},
	autoConnect: false
});

socket.on("connect", () => {

	console.log(socket.id)
	const globalStore = useGlobalStore();
	const toast = useToast();

	socket.on('addNotification', (notification: Notification) => {
		globalStore.addNotification(notification);
		if (notification.type == NotificationType.FRIEND_REQUEST) globalStore.addPendingFriend(notification.from_user)
		else if (notification.type == NotificationType.FRIEND_ACCEPT) globalStore.addFriend(notification.from_user)
		else if (notification.type == NotificationType.FRIEND_DECLINE) globalStore.removePendingFriend(notification.from_user.id)
		else if (notification.type == NotificationType.FRIEND_REMOVE) globalStore.removeFriend(notification.from_user.id)
		toast.info(notification.message)
	});
})

export default socket;
