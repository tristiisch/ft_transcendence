// https://socket.io/fr/docs/v4/typescript/
// TEST socket.io server <-> client

import { Server } from "socket.io";
import { startMatch } from "../game/matchs/matchs.sockets"

interface ServerToClientEvents {
	ball: (x: number, y: number) => void;
}

interface ClientToServerEvents {
	start_match: () => void;
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

	const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
		{ 
			cors: { origin: `${process.env.FRONT_PREFIX}://${process.env.FRONT_HOST}:${process.env.FRONT_PORT}` }
		}
	);

	var started = false // temporary thing, just because it's making a new startMatch on each page reload
	
	io.on("connection", (socket) => {
		console.log('[SOCKET.IO]', 'SERVER', 'new connection id =>', socket.id);
		socket.on("start_match", () => {
			if (started === false)
			{
				console.log('[SOCKET.IO]', 'SERVER',  "receive 'START_MATCH'");
				startMatch(io)
				// setInterval(function() { io.emit("ball", 50, 50) }, 1000)
				started = true
			}
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
