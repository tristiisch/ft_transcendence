// https://socket.io/fr/docs/v4/typescript/
// TEST socket.io server <-> client

import { Server } from "socket.io";
//import { startMatch } from "../game/matchs/matchs.sockets"
//import { createCanvas, loadImage } from 'canvas'

interface ServerToClientEvents {
	ball: (x: number, y: number) => void;
}

interface ClientToServerEvents {
	start_match: () => void;
	p1_dy: (dy: number) => void; 
}

interface InterServerEvents {
	ping: () => void;
}

interface SocketData {
	name: string;
	age: number;
}

async function startMatch(socket)
{

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
			// if (started === false)
			// {
				console.log('[SOCKET.IO]', 'SERVER',  "receive 'START_MATCH'");
				const width = 3989
				const height = 2976
				var x = width/2
				var y = height/2
				var dx = 2
				var dy = -2

				const blocker_width = width / 50
				const blocker_height = height / 5
				console.log("blocker height", blocker_height)
				const p1_xpos = width / 10
				const p2_xpos = width - width / 10
				var p1_ypos = height / 2 - blocker_height / 2
				var p2_ypos = height / 2 - blocker_height / 2

				socket.on('p1_dy', function(dy: number) {
					p1_ypos = dy
				})
				// socket.on('p2_dy', function(dy: number) {
				// 	p2_ypos += dy
				// })

//				let canvas = createCanvas(3989, 2976)
//				canvas.width = 3989
//				canvas.height = 2976
//				var context = canvas.getContext('2d')
//				loadImage("https://i.ibb.co/9ZrtvT4/stage.png").then((img) => {
//					context.drawImage(img, 0, 0, 3989, 2976)
					setInterval(function() {
						// console.log(context.getImageData(x, y, 1, 1).data)
						if (x + dx < 0 || x + dx > width) { dx = -dx }
						if (y + dy < 0 || y + dy > height) { dy = -dy }
						// let rgba = context.getImageData(x + dx, y, 1, 1).data
						// let rgba2 = context.getImageData(x, y + dy, 1, 1).data
						// if (y > 300 && y < 2700 && !(rgba[0] === 255 && rgba[1] === 255 && rgba[2] === 255 && rgba[2] === 255))
						// 	dx = -dx
						// if (x > 200 && x < 3800 && !(rgba2[0] === 255 && rgba2[1] === 255 && rgba2[2] === 255 && rgba2[2] === 255))
						// 	dy = -dy
						if (x > p1_xpos && x < p1_xpos + blocker_width && x + dx > p1_xpos && x + dx < p1_xpos + blocker_width && y + dy > p1_ypos && y + dy < p1_ypos + blocker_height)
							dy = -dy
						else if (x + dx > p1_xpos && x + dx < p1_xpos + blocker_width && y + dy > p1_ypos && y + dy < p1_ypos + blocker_height)
							dx = -dx
						x += dx
						y += dy
						socket.emit("ball", x, y)

						//dx += dx < 0 ? -0.0001 : 0.0001
					}, 1)
				//})
				started = true
			// }
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
