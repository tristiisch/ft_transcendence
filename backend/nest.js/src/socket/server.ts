// https://socket.io/fr/docs/v4/typescript/
// TEST socket.io server <-> client

import { Server } from "socket.io";

interface ServerToClientEvents {
	noArg: () => void;
	basicEmit: (a: number, b: string, c: Buffer) => void;
	withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
	hello: () => void;
}

interface InterServerEvents {
	ping: () => void;
}

interface SocketData {
	name: string;
	age: number;
}

export async function createSocketServer(serverPort: number) {
	console.log('[SOCKET.IO]', 'SERVER', "Starting server socket.io ...")

	const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>({ cors: { origin: 'http://localhost:8000' } });

	io.on("connection", (socket) => {
		
		console.log('[SOCKET.IO]', 'SERVER', 'new connection id =>', socket.id);
		socket.emit("noArg");
		socket.emit("basicEmit", 1, "2", Buffer.from([3]));
		socket.emit("withAck", "4", (e) => {
			console.log('[SOCKET.IO]', 'SERVER', socket.id, 'withAck', e);
			// e is inferred as number
		});

		// works when broadcast to all
		io.emit("noArg");

		// works when broadcasting to a room
		io.to("room1").emit("basicEmit", 1, "2", Buffer.from([3]));

		socket.on("hello", () => {
			console.log('[SOCKET.IO]', 'SERVER',  "receive 'HELLO'");
			// ...
		});
	});

	// io.serverSideEmit("ping"); // 'this adapter does not support the serverSideEmit() functionality' => error msg on Windows & Linux setup (WSL Ubuntu)

	io.on("ping", () => {
		console.log('[SOCKET.IO]', 'SERVER', 'ping');
		// ...
	});

	io.listen(serverPort);
	console.log('[SOCKET.IO]', 'SERVER', "Server socket.io is started !")
}
