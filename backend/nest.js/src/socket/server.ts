// https://socket.io/fr/docs/v4/typescript/
// TEST socket.io server <-> client

import { Socket } from "engine.io";
import { map } from "rxjs";
import { Server } from "socket.io";
//import { startMatch } from "../game/matchs/matchs.sockets"
//import { createCanvas, loadImage } from 'canvas'
interface UserStatus {
	id: number
	status: Status
  }

enum ChatStatus {
	PUBLIC,
	PRIVATE,
	PROTECTED,
	DISCUSSION
}

interface Message {
	idMessage?: number,
	idChat?: number,
	date: string,
	message: string,
	idSender: number
}

interface Discussion extends Chat {
	user: User,
}

interface User {
	id: number;
	login_42: string;
	avatar: string;
	avatar_64?: string;
	username: string;
	status: Status;
}

interface Chat {
	id?: number,
	type: ChatStatus,
	messages: Message[]
}

interface Channel extends Chat {
	name: string,
	avatar: string,
	users: User[],
	password: string | null
	admins: User[],
	owner: User,
	muted: User[],
	banned: User[]
}

enum Status {
	OFFLINE,
	ONLINE,
	INGAME,
	SPEC,
}

interface ServerToClientEvents {
	ball: (x: number, y: number) => void;
	hey: (s: string) => void;
	update_status: (data: UserStatus) => void;
	userAdd: (user: User) => void;
	userRemove: (user: User) => void;
	chatDiscussionCreate: (discussion: Discussion) => void;
	chatChannelCreate: (channel: Channel) => void;
	chatChannelDelete: (channel: Channel) => void;
	chatChannelJoin: (chanelName: string, joinedUser: User) => void;
	chatChannelLeave: (channel: Channel, user: User) => void;
	chatChannelBan: (channel: Channel, banList: User[]) => void;
	chatChannelAdmin:(channel: Channel, adminList: User[]) => void;
	chatChannelMute: (channel: Channel, muteList: User[]) => void;
	chatMessage: (type: ChatStatus, data: Message) => void;
}

interface ClientToServerEvents {
	start_match: () => void;
	p1_dy: (dy: number) => void;
	match: (id: number) => void;
	update_status: (status: Status) => void;
	chatDiscussionCreate: (user: User, discussion: Discussion) => void;
	chatChannelCreate: (userId: number, channel: Channel) => void;
	chatChannelDelete: (channel: Channel) => void;
	chatChannelJoin: (chanelName: string, joinedUser: User) => void;
	chatChannelLeave: (channel: Channel, user: User) => void;
	chatChannelBan: (channel: Channel, banList: User[]) => void;
	chatChannelAdmin:(channel: Channel, adminList: User[]) => void;
	chatChannelMute: (channel: Channel, muteList: User[]) => void;
	chatDiscussionMessage: (message: Message, target: number) => void;
	chatChannelMessage: (channel: Channel, data: Message) => void;
}

interface InterServerEvents {
	ping: () => void;
}

interface SocketData {
	name: string;
	age: number;
}

async function startMatch(io, id)
{
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
	var p1_ypos = height / 2 - blocker_height / 2
	var p2_ypos = height / 2 - blocker_height / 2

	// socket.on('p1_dy', function(dy: number) {
	// 	p1_ypos = dy
	// })
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
			if ((x > p1_xpos && x < p1_xpos + blocker_width && x + dx > p1_xpos && x + dx < p1_xpos + blocker_width && y + dy > p1_ypos && y + dy < p1_ypos + blocker_height) ||
				(x > p2_xpos && x < p2_xpos + blocker_width && x + dx > p2_xpos && x + dx < p2_xpos + blocker_width && y + dy > p2_ypos && y + dy < p2_ypos + blocker_height))
					dy = -dy
			else if ((x + dx > p1_xpos && x + dx < p1_xpos + blocker_width && y + dy > p1_ypos && y + dy < p1_ypos + blocker_height) ||
					(x + dx > p2_xpos && x + dx < p2_xpos + blocker_width && y + dy > p2_ypos && y + dy < p2_ypos + blocker_height))
					dx = -dx
			x += dx
			y += dy
			io.emit("ball", x, y)

			//dx += dx < 0 ? -0.0001 : 0.0001
		}, 1)
	//})
}

export async function createSocketServer(serverPort: number) {
	console.log('[SOCKET.IO]', 'SERVER', "Starting server socket.io ...")

	const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
		{
			cors: { origin: `${process.env.FRONT_PREFIX}://${process.env.FRONT_HOST}:${process.env.FRONT_PORT}` }
		}
	);

	var started = false // temporary thing, just because it's making a new startMatch on each page reload
	var users = new Map<string, string>()

	io.on("connection", (socket) => {
		console.log('[SOCKET.IO]', 'SERVER', 'new connection id =>', socket.id, 'with jwt =>', socket.handshake.auth.token);
		users[socket.handshake.auth.token] = socket.id

		socket.on("match", (id) => {
			socket.join('match_' + id)
			const clients = io.sockets.adapter.rooms.get('match_' + id);
			const numClients = clients ? clients.size : 0;
			io.to('match_' + id).emit('hey', 'hey bois[' + numClients + ']: ' + socket.id)
			if (numClients == 2)
			{
				startMatch(io, id)
			}
		});
		socket.on("start_match", () => {
			// if (started === false)
			// {
				console.log('[SOCKET.IO]', 'SERVER',  "receive 'START_MATCH'");
				started = true
			// }
		});

		socket.on("update_status", (status) => {
			console.log(status)
			const data = { id: 2,
				status: status }
			socket.broadcast.emit("update_status", (data))
		});

		// socket.on("userAdd", (user) => {             // transform to io
		// 	socket.broadcast.emit("userAdd", (user));
		// });
		
		// socket.on("userRemove", (user) => {
		// 	socket.broadcast.emit("userRemove", (user));
		// });
		
		socket.on("chatDiscussionCreate", (user, discussion) => {
			const user1 = user.id.toString();
			const user2 = discussion.user.id.toString()
			const roomName = user1 + user2;
			socket.join(roomName)
			socket.to(discussion.user.username).emit("chatDiscussionCreate", (discussion));
		});

		socket.on("chatChannelCreate", (userId, channel) => {
			socket.join(channel.name);
			if (channel.type !== ChatStatus.PRIVATE)
				socket.broadcast.emit("chatChannelCreate", (channel));
		});
		
		socket.on("chatChannelDelete", (channel) => {
			socket.broadcast.emit("chatChannelDelete", (channel));
		});
		
		socket.on("chatChannelJoin", (channelName, joinedUser) => {
			socket.join(channelName)
			socket.broadcast.emit("chatChannelJoin", channelName, joinedUser);
		});
		
		socket.on("chatChannelLeave", (channel, user) => {
			socket.leave(channel.name);
			socket.broadcast.emit("chatChannelLeave", channel, user);
		});
		
		socket.on("chatChannelBan", (channel, newBanList) => {
			socket.broadcast.emit("chatChannelBan", channel, newBanList);
		});
		
		socket.on("chatChannelAdmin", (channel, newAdminList) => {
			socket.broadcast.emit("chatChannelAdmin", channel, newAdminList);
		});
		
		socket.on("chatChannelMute", (channel, newMuteList) => {
			socket.broadcast.emit("chatChannelMute", channel, newMuteList);
		});

		socket.on("chatDiscussionMessage", (message, target) => {
			console.log(message, target);
			// const user1 = message.idSender.toString();
			// const user2 = target.toString()
			// const roomName = user1 + user2;
			// socket.to(roomName).emit("chatMessage", ChatStatus.DISCUSSION, message);  // need room implementation, no broadcast
			socket.broadcast.emit("chatMessage", ChatStatus.DISCUSSION, message);
		});

		socket.on("chatChannelMessage", (channel, data) => {
			socket.to(channel.name).emit("chatMessage", channel.type, data);
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
