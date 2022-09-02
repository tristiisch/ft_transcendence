// https://socket.io/fr/docs/v4/typescript/
// TEST socket.io server <-> client

import { Jwt } from "jsonwebtoken";
import { map } from "rxjs";
import { Server } from "socket.io";
import { MatchOwn } from "src/game/matchs/entity/own-match.entity";
//import { startMatch } from "../game/matchs/matchs.sockets"
//import { createCanvas, loadImage } from 'canvas'
interface UserStatus {
	id: number
	status: Status
  }

enum Status {
	OFFLINE,
	ONLINE,
	INGAME,
	SPEC,
}

interface ServerToClientEvents {
	//matches
	ball: (x: number, y: number) => void;
	hey: (s: string) => void;
	p1_ypos: (y: number) => void;
	p2_ypos: (y: number) => void;
	//others
	update_status: (data: UserStatus) => void;
}

interface ClientToServerEvents {
	//matches
	p1_ypos: (dy: number) => void;
	p2_ypos: (dy: number) => void;
	match: (id: number) => void;
	//others
	update_status: (status: Status) => void;
}

interface InterServerEvents {
	ping: () => void;
}

interface SocketData {
	name: string;
	age: number;
}

async function startMatch(match, match_room)
{
	match.started = true

	const width = 3989
	const height = 2976
	const ball_size = width / 100
	var x = width/2
	var y = height/2
	var dx = 3
	var dy = -3

	const blocker_width = width / 50
	const blocker_height = height / 5
	//console.log("blocker height", blocker_height)
	const p1_xpos = width / 10
	const p2_xpos = width - width / 10
	match.p1_ypos = height / 2 - blocker_height / 2
	match.p2_ypos = height / 2 - blocker_height / 2

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
			if ((x > p1_xpos && x < p1_xpos + blocker_width && x + dx > p1_xpos && x + dx < p1_xpos + blocker_width && y + dy > match.p1_ypos && y + dy < match.p1_ypos + blocker_height) ||
				(x > p2_xpos && x < p2_xpos + blocker_width && x + dx > p2_xpos && x + dx < p2_xpos + blocker_width && y + dy > match.p2_ypos && y + dy < match.p2_ypos + blocker_height))
					dy = -dy
			else if ((x + dx > p1_xpos && x + dx < p1_xpos + blocker_width && y + dy > match.p1_ypos && y + dy < match.p1_ypos + blocker_height) ||
					(x + dx > p2_xpos && x + dx < p2_xpos + blocker_width && y + dy > match.p2_ypos && y + dy < match.p2_ypos + blocker_height))
					dx = -dx
			x += dx
			y += dy
			match_room.emit("ball", x, y)

			//dx += dx < 0 ? -0.0001 : 0.0001
		}, 1)
	//})
}

interface Match {
	room: any,
	started: boolean,
	p1_jwt: any,
	p2_jwt: any,
	p1_ypos: number,
	p2_ypos: number
}

export async function createSocketServer(serverPort: number) {
	console.log('[SOCKET.IO]', 'SERVER', "Starting server socket.io ...")

	const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
		{
			cors: { origin: `${process.env.FRONT_PREFIX}://${process.env.FRONT_HOST}:${process.env.FRONT_PORT}` }
		}
	);

	var users = new Map<string, string>()
	var matches = new Map<number, Match>()

	io.on("connection", (socket) => {
		let user_token = socket.handshake.auth.token
		console.log('[SOCKET.IO]', 'SERVER', 'new connection id =>', socket.id, 'with jwt =>', user_token);
		users[user_token] = socket.id

		socket.on("match", (id) => {
			if (matches.has(id) === false)
				matches.set(id, { room: io.to('match_' + id), started:false, p1_jwt: socket.id, p2_jwt: null, p1_ypos: 0, p2_ypos: 0 })
			console.log(matches)
			let match = matches.get(id)
			socket.join('match_' + id)
			const clients = io.sockets.adapter.rooms.get('match_' + id);
			const numClients = clients ? clients.size : 0;
			io.to('match_' + id).emit('hey', 'hey bois[' + numClients + ']: ' + socket.id)
			console.log(socket.id, match.p1_jwt)
			if (socket.id === match.p1_jwt) {
				socket.on("p1_ypos", function(y) {
					match.p1_ypos = y
					socket.to('match_' + id).emit('p1_ypos', y)
				})
			}
			else if (socket.id === match.p2_jwt) {
				socket.on("p2_ypos", function(y) {
					match.p2_ypos = y
					socket.to('match_' + id).emit('p2_ypos', y)
				})
			}
			if (numClients == 2 && match.started == false)
			{
				startMatch(match, io.to('match_' + id))
			}
		});

		socket.on("update_status", (status) => {
			console.log("status=", status)
			const data = { id: 2,
				status: status }
			socket.broadcast.emit("update_status", (data))
		});
	})
	// io.serverSideEmit("ping"); // 'this adapter does not support the serverSideEmit() functionality' => error msg on Windows & Linux setup (WSL Ubuntu)

	io.on("ping", () => {
		console.log('[SOCKET.IO]', 'SERVER', 'ping');
		// ...
	});

	io.listen(serverPort);
	console.log('[SOCKET.IO]', 'SERVER', "Server socket.io is started !")
}
