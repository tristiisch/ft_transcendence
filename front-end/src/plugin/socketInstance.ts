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

	socket.on('addNotification', (target: User, notification: Notification) => {
		console.log(target)
		console.log(notification.from_user)
		globalStore.addNotification(notification);
		if (notification.type == NotificationType.FRIEND_REQUEST)
		{
			console.log('request')
			console.log(notification.from_user)
			globalStore.addPendingFriend(notification.from_user)
		}
		else if (notification.type == NotificationType.FRIEND_ACCEPT) 
		{
			console.log('Accept')
			console.log(notification.from_user)
			globalStore.addFriend(notification.from_user)
		}
		else if (notification.type == NotificationType.FRIEND_DECLINE)
		{
			console.log('Decline')
			console.log(notification.from_user)
			globalStore.removePendingFriend(notification.from_user.id)
		}
		else if (notification.type == NotificationType.FRIEND_REMOVE)
		{
			console.log('Remove')
			console.log(notification.from_user)
			globalStore.removeFriend(notification.from_user.id)
		}
		toast.info(notification.message)
	});

	/*socket.on('addFriend', (target: User, notification: Notification) => {
		globalStore.addNotification(notification);
		globalStore.addFriend(target)
		toast.info(notification.message)
	});

	socket.on('removeFriend', (targetId: number) => {
		globalStore.removeFriend(targetId)
	});*/
})

export default socket;
