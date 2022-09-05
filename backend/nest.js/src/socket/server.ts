// https://socket.io/fr/docs/v4/typescript/
// TEST socket.io server <-> client

import { Socket } from "engine.io";
import { Jwt } from "jsonwebtoken";
import { map } from "rxjs";
import { Server } from "socket.io";

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
	//matches
	start_match: () => void;
	ball: (x: number, y: number) => void;
	hey: (s: string) => void;
	p1_ypos: (y: number) => void;
	p2_ypos: (y: number) => void;
	//others
	update_status: (data: UserStatus) => void;
	userAdd: (user: User) => void;
	userRemove: (user: User) => void;
	chatDiscussionCreate: (discussion: Discussion) => void;
	chatChannelCreate: (channel: Channel) => void;
	chatChannelDelete: (channel: Channel) => void;
	chatChannelJoin: (chanelName: string, joinedUser: User) => void;
	chatChannelLeave: (channel: Channel, user: User) => void;
	chatChannelBan: (channel: Channel, newBanList:{ newList: User[], userWhoSelect: User}) => void;
	chatChannelAdmin:(channel: Channel, newAdminList: { newList: User[], userWhoSelect: User}) => void;
	chatChannelMute: (channel: Channel, newMuteList: { newList: User[], userWhoSelect: User} ) => void;
	chatChannelName: (channel: Channel, newName: { name: string, userWhoChangeName: User}) => void
	chatDiscussionMessage: (discussion: Discussion, data: Message) => void;
	chatChannelMessage: (channel: Channel, data: Message) => void;
}

interface ClientToServerEvents {
	//matches
	match: (id: number) => void;
	p1_ypos: (dy: number) => void;
	p2_ypos: (dy: number) => void;
	//others
	update_status: (status: Status) => void;
	chatDiscussionCreate: (user: User, discussion: Discussion) => void;
	chatChannelCreate: (userId: number, channel: Channel) => void;
	chatChannelDelete: (channel: Channel) => void;
	chatChannelJoin: (chanelName: string, joinedUser: User) => void;
	chatChannelLeave: (channel: Channel, user: User) => void;
	chatChannelBan: (channel: Channel, newBanList:{ newList: User[], userWhoSelect: User}) => void;
	chatChannelAdmin:(channel: Channel, newAdminList: { newList: User[], userWhoSelect: User}) => void;
	chatChannelMute: (channel: Channel, newMuteList: { newList: User[], userWhoSelect: User} ) => void;
	chatChannelName: (channel: Channel, newName: { name: string, userWhoChangeName: User}) => void
	chatDiscussionMessage: (discussion: Discussion, message: Message) => void;
	chatChannelMessage: (channel: Channel, message: Message) => void;
}

interface InterServerEvents {
	ping: () => void;
}

interface SocketData {
	name: string;
	age: number;
}

async function startMatch(match)
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

	match.room.emit("start_match")
	setTimeout(() => {

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
			match.room.emit("ball", x, y)

			//dx += dx < 0 ? -0.0001 : 0.0001
		}, 1)
	//})
	}, 3000)
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
	//var usersSocket = new Map<number, string>() Map for store userId and socker for emit
	var matches = new Map<number, Match>()

	io.on("connection", (socket) => {
		let user_token = socket.handshake.auth.token
		console.log('[SOCKET.IO]', 'SERVER', 'new connection id =>', socket.id, 'with jwt =>', user_token);
		users[user_token] = socket.id
		//usersSocket[function to find user by jwt] = socket
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
				startMatch(match)
			}
		});

		socket.on("update_status", (status) => {
			console.log("status=", status)
			const data = { id: 2,
				status: status }
			socket.broadcast.emit("update_status", (data))
		});

		//socket.on("update_status", (status) => {
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
			// socket.id
			// socket.join(channel.name);users[socket.handshake.auth.token]
			//need to add each socket id of members in join
			if (channel.type !== ChatStatus.PRIVATE)
				//socket.to(channel.name).emit("chatChannelCreate", (channel));   socket id not added to join => so for test i use broadcast
				socket.broadcast.emit("chatChannelCreate", (channel))  //to delete when join you have implemented join
			});

		socket.on("chatChannelDelete", (channel) => {
			//socket.to(channel.name).emit("chatChannelDelete", (channel)); // need room implementation, no broadcast
			socket.broadcast.emit("chatChannelDelete", (channel));
		});

		socket.on("chatChannelJoin", (channelName, joinedUser) => {
			// socket.join(channelName)       										// need room implementation, no broadcast
			socket.broadcast.emit("chatChannelJoin", channelName, joinedUser);
		});

		socket.on("chatChannelLeave", (channel, user) => {
			// socket.leave(channel.name);
			socket.broadcast.emit("chatChannelLeave", channel, user); // need room implementation, no broadcast
		});

		socket.on("chatChannelBan", (channel, newBanList) => {
			// socket.to(channel.name).emit("chatChannelName", channel, newBanList);  // need room implementation, no broadcast
			socket.broadcast.emit("chatChannelBan", channel, newBanList);
		});

		socket.on("chatChannelAdmin", (channel, newAdminList) => {
			// socket.to(channel.name).emit("chatChannelAdmin", channel, newAdminList);  // need room implementation, no broadcast
			socket.broadcast.emit("chatChannelAdmin", channel, newAdminList);
		});

		socket.on("chatChannelMute", (channel, newMuteList) => {
			// socket.to(channel.name).emit("chatChannelMute", channel, newMuteList);  // need room implementation, no broadcast
			socket.broadcast.emit("chatChannelMute", channel, newMuteList);
		});

		socket.on("chatChannelName", (channel, newName) => {
			// socket.to(channel.name).emit("chatChannelName", channel, newName);  // need room implementation, no broadcast
			socket.broadcast.emit("chatChannelName", channel, newName);
		});

		socket.on("chatDiscussionMessage", (discussion, message) => {
			// socket.to(roomName).emit("chatMessage", ChatStatus.DISCUSSION, message);  // need room implementation, no broadcast
			socket.broadcast.emit("chatDiscussionMessage", discussion, message);
		});

		socket.on("chatChannelMessage", (channel, message) => {
			//socket.to(channel.name).emit("chatMessage", channel.type, data);  // need room implementation, no broadcast
			socket.broadcast.emit("chatChannelMessage", channel, message);
		});
	})
	// io.serverSideEmit("ping"); // 'this adapter does not support the serverSideEmit() functionality' => error msg on Windows & Linux setup (WSL Ubuntu)

	io.on("ping", () => {
		console.log('[SOCKET.IO]', 'SERVER', 'ping');
		// ...
	});

	io.listen(serverPort);
	console.log('[SOCKET.IO]', 'SERVER', "Server socket.io is started !")

	})
}
