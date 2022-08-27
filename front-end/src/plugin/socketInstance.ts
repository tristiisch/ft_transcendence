import { io } from "socket.io-client";
import { useUserStore } from "@/stores/userStore";

const authString = localStorage.getItem('userAuth')!;
const URL = "http://localhost:3001";
const socket = io(URL, {
	auth: { token: JSON.parse(authString).token_jwt },
	autoConnect: false
});

// socket.onAny((event, ...args) => {
//     console.log(event, args);
//   });

export default socket;
