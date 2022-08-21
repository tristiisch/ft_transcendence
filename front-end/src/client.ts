// https://socket.io/fr/docs/v4/typescript/
// TEST socket.io server <-> client

import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
	ball: (x: number, y: number) => void;
}

interface ClientToServerEvents {
	start_match: () => void;
}

export async function createClient(serverHost: string, serverPort: number) {

	const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`http://${serverHost}:${serverPort}`);

	console.log('[SOCKET.IO]', 'CLIENT', "Starting client socket.io ...")
	socket.emit("start_match");
	
	socket.on("ball", (x, y) => {
		console.log('[SOCKET.IO]', 'CLIENT', 'ball', x, y);
		// a is inferred as number, b as string and c as buffer
	});
	
	socket.on("connect", () => {
		console.log('[SOCKET.IO]', 'CLIENT', "connected to server !")
	});

	socket.on("disconnect", (reason) => {
		if (reason === "io server disconnect") {
			console.log('[SOCKET.IO]', 'CLIENT', "server close connection.", reason)
			// the disconnection was initiated by the server, you need to reconnect manually
			socket.connect();
		} else {
			console.log('[SOCKET.IO]', 'CLIENT', "lost connection to server.", reason)
		}
	});

	console.log('[SOCKET.IO]', 'CLIENT', "Client socket.io is started !")
}
