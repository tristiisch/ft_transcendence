// https://socket.io/fr/docs/v4/typescript/
// TEST socket.io server <-> client

import { io, Socket } from "socket.io-client";

export interface ServerToClientEvents {
	ball: (x: number, y: number) => void;
}

export interface ClientToServerEvents {
	start_match: () => void;
	p1_dy: (dy: number) => void; 
}

export function createClient(serverHost: string, serverPort: number) {

	const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`http://${serverHost}:${serverPort}`);
	configureClient(socket)
	return socket
}

async function configureClient(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
	console.log('[SOCKET.IO]', 'CLIENT', "Starting client socket.io ...")
	socket.emit("start_match");
	
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
