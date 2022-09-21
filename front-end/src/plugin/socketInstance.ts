import { io } from "socket.io-client";
import { useGlobalStore } from '@/stores/globalStore';
import type Notification from '@/types/Notification';
import type User from '@/types/User';
import { useToast } from 'vue-toastification';
import type LeaderboardUser from '@/types/Leaderboard';
import type { UserStatus } from '@/types/User';

const URL = "http://localhost:3000";
// const URL = import.meta.env.VITE_API_URL;
const socket = io(URL, {
	auth: {token: null},
	autoConnect: false
});

socket.on("connect", () => {

	console.log(socket.id)
	const globalStore = useGlobalStore();
	const toast = useToast();

	socket.on('friendRequest', (sender: User, notification: Notification) => {
		globalStore.addNotification(notification);
		globalStore.addPendingFriend(sender)
		toast.info(notification.message)
	});

	socket.on('addFriend', (target: User, notification: Notification) => {
		globalStore.addNotification(notification);
		globalStore.addFriend(target)
		toast.info(notification.message)
	});

	socket.on('removeFriend', (targetId: number) => {
		globalStore.removeFriend(targetId)
	});
})

export default socket;
