// https://socket.io/fr/docs/v4/typescript/
// TEST socket.io server <-> client

import { io, Socket } from "socket.io-client";
import { Buffer } from "buffer";

interface ServerToClientEvents {
	noArg: () => void;
	basicEmit: (a: number, b: string, c: Buffer) => void;
	withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
	hello: () => void;
}

export async function createClient(serverHost: string, serverPort: number) {

	const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`http://${serverHost}:${serverPort}`);

	console.log('[SOCKET.IO]', 'CLIENT', "Starting client socket.io ...")
	socket.emit("hello");
	
	socket.on("noArg", () => {
		console.log('[SOCKET.IO]', 'CLIENT', 'noArg');
		// ...
	});
	
	socket.on("basicEmit", (a, b, c) => {
		console.log('[SOCKET.IO]', 'CLIENT', 'basicEmit', a, b, c);
		// a is inferred as number, b as string and c as buffer
	});
	
	socket.on("withAck", (d, callback) => {
		console.log('[SOCKET.IO]', 'CLIENT', 'withAck', d);
		// d is inferred as string and callback as a function that takes a number as argument
		callback.call(this, 'Hello world !');
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
