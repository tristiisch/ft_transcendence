import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	ConnectedSocket,
	WsException,
} from '@nestjs/websockets';
import { ChatService } from 'chat/chat.service';
import { ChannelCreateDTO, ChannelSelectDTO } from 'chat/entity/channel-dto';
import { Channel, ChannelFront, ChannelPrivate, ChannelProtected } from 'chat/entity/channel.entity';
import { Server, Socket } from 'socket.io';
import { User, UserStatus } from 'users/entity/user.entity';
import { SocketService } from './socket.service';
import { Message, MessageFront, MessageType } from 'chat/entity/message.entity';
import { Chat, ChatFront, ChatStatus } from 'chat/entity/chat.entity';
import { Discussion, DiscussionFront } from 'chat/entity/discussion.entity';
import { ForbiddenException, forwardRef, Inject, Logger, NotAcceptableException, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { comparePassword } from 'utils/bcrypt';
import { JwtSocketGuard } from './strategy/jwt-socket.strategy';
import { UsersService } from 'users/users.service';
import { AuthService } from 'auth/auth.service';
import { MatchService } from 'game/matchs/matchs.service';
import { validate, validateOrReject } from 'class-validator';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Notification, NotificationFront, NotificationType } from 'notification/entity/notification.entity';
import { NotificationService } from 'notification/notification.service';
import { MatchMakingTypes } from 'game/matchs/entity/match.entity';

@WebSocketGateway({
	cors: { origin: [process.env.FRONT_URL, `http://localhost:${process.env.FRONT_PORT}`] }
})

export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(
		private socketService: SocketService,
		@Inject(forwardRef(() => ChatService))
		private readonly chatService: ChatService,
		@Inject(forwardRef(() => UsersService))
		private readonly userService: UsersService,
		@Inject(forwardRef(() => AuthService))
		private readonly authService: AuthService,
		@Inject(forwardRef(() => MatchService))
		private readonly matchService: MatchService,
		@Inject(forwardRef(() => NotificationService))
		private readonly notifService: NotificationService
	) {}

	afterInit(server: Server): void {
		this.socketService.server = server;
	}

	async handleConnection(clientSocket: Socket) {
		try {
			clientSocket.prependAny((eventName, ...args) => {
				Logger.debug(`Receive ${eventName} => ${JSON.stringify(args)}`, 'WebSocket');
			});
			clientSocket.prependAnyOutgoing((eventName, ...args) => {
				Logger.debug(`Send ${eventName} <= ${JSON.stringify(args)}`, 'WebSocket');
			});
			clientSocket.on("ping", (count) => {
				Logger.debug(`Ping ${count}`, 'WebSocket');
			});

			const user = await this.socketService.getUserFromSocket(clientSocket);

			if (!user) return clientSocket.disconnect();

			this.socketService.saveClientSocket(user, clientSocket.id);
			this.updateStatus(clientSocket, user, UserStatus.ONLINE);
		} catch (err) {
			Logger.error(`Cannot handle connection ${err.message}`, 'WebSocket');
		}
	}

	async handleDisconnect(clientSocket: Socket) {
		try {
			const user = await this.socketService.getUserFromSocket(clientSocket);

			this.cancelFindMatch(clientSocket)
			this.updateStatus(clientSocket, user, UserStatus.OFFLINE);
			this.socketService.deleteClientSocket(user.id, clientSocket);
		} catch (err) {
			Logger.error(`Cannot get user from socket for handleDisconnect: ${err.message}`, 'WebSocket');
		}
	}

	updateStatus(clientSocket: Socket, user: User, status: UserStatus) {
		clientSocket.broadcast.emit('updateUserStatus', ({ id: user.id, status: status }))
		this.userService.getRepo().update(user.id, { status: status });
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage(null)
	handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket, @Req() req) {
		Logger.debug(`Client ${req.user.username} send us a msg`, 'WebSocket');
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('updateUserStatus')
	handleUserStatus(@MessageBody() data: number, @ConnectedSocket() client: Socket, @Req() req) {
		const user: User = req.user;
		client.broadcast.emit('updateUserStatus', ({id: user.id, status: data}))
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelCreate')
	async createChannel(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req): Promise<ChannelFront> {
		const user: User = req.user;
		const channelDTO: ChannelCreateDTO = body[1];
		const password: string = body[2];

		channelDTO.password = password;
		try {
			const channel: Channel = await this.chatService.createChannel(user, channelDTO);
			const channelFront: ChannelFront = await channel.toFront(this.chatService, user, [user]);

			await channel.sendMessageFrom(this.socketService, user, "chatChannelCreate", channelFront, user);
			return channelFront;
		} catch (err) {
			throw new WsException(err.message);
		}
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatDiscussionCreate')
	async chatDiscussionCreate(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req): Promise<DiscussionFront> {
		const user: User = req.user;
		const discussionFront: DiscussionFront = body[1];
		const discu: Discussion = {
			type: ChatStatus.DISCUSSION,
			users_ids: [user.id, discussionFront['user'].id],
			hidden_ids: undefined
		}
		let newDiscu: Discussion;
		try {
			newDiscu = await this.chatService.addDiscussion(discu);
		} catch (err) {
			if (err instanceof NotAcceptableException) {
				// finalDiscu = await this.chatService.findUserDiscussion
			}
			throw err;
		}
		const finalDiscu: Discussion = await this.chatService.fetchChat(user, newDiscu.id, newDiscu.type) as Discussion;
		return finalDiscu.toFront(this.chatService, user, [user]);
	}


	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatDiscussionMessage')
	async chatDiscussionMessage(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const user: User = req.user;
		const targetId: number = body[0];
		const messageDTO: MessageFront = body[1];
		const target: User = await this.userService.findOne(targetId);

		messageDTO.idSender = user.id;

		if (target.isBlockedUser(user.id)) {
			throw new WsException(`You have been blocked by ${target.username}, you can't send him a message.`);
		}
		if (user.isBlockedUser(target.id)) {
			throw new WsException(`You have blocked ${target.username}, you can't send him a message.`);
		}

		const discu: Discussion = await this.chatService.findOrCreateDiscussion(messageDTO.idSender, targetId);
		try {
			let message: Message = new Message();
			message.id_sender = messageDTO.idSender;
			message.id_channel = discu.id;
			message.message = messageDTO.message;
			message.type = messageDTO.type;

			if (message.type === MessageType.GAME_INVIT) {
				message.canUseButton = true;
				await this.matchService.addRequest(req.user, target.id, null);
			}

			message = await this.chatService.addMessage(message);
			const msgFront: MessageFront = message.toFront(user, null);
			const discuFront: DiscussionFront = await discu.toFront(this.chatService, user, [user]);
			
			////////////
			/*let notif: Notification = new Notification();
			notif.user_id = target.id;
			notif.from_user_id = user.id;
			notif.type = NotificationType.MATCH_REQUEST;
			notif = await this.notifService.addNotif(notif);
			this.socketService.AddNotification(target, await notif.toFront(this.userService, [user, target]));*/
			//////////////

			discu.sendMessage(this.socketService, user, 'chatDiscussionMessage', discuFront, msgFront, user);
			// client.broadcast.emit("chatDiscussionMessage", discussion, msgFront);
			// tempDiscu.sendMessage(this.socketService, "chatDiscussionMessage", discuFront, msgFront);
			return [discuFront, msgFront];
		} catch (err) {
			throw new WsException(err.message);
		}
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelMessage')
	async chatChannelMessage(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const user: User = req.user;
		const channelDTO: ChannelSelectDTO = body[0];
		const msgFront: MessageFront = body[1];

		validate(channelDTO);
		//if (channelDTO.id == null || !channelDTO.type)
		//	throw new WsException(`Channel of message must be a valid channel with id & type.`);

		if (msgFront.idSender !== -1)
			msgFront.idSender = user.id;
		const channel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);
		if (!channel.users_ids || channel.users_ids.indexOf(user.id) === -1) {
			throw new WsException(`You are not in channel ${channel.name}`);
		} else if (channel.banned_ids && channel.banned_ids.indexOf(user.id) !== -1) {
			throw new WsException(`You are banned in channel ${channel.name}`);
		} else if (channel.muted_ids && channel.muted_ids.indexOf(user.id) !== -1) {
			throw new WsException(`You are mute in channel ${channel.name}`);
		}
		try {
			let msg: Message = new Message();
			msg.id_sender = msgFront.idSender;
			msg.id_channel =  channel.id;
			msg.message = msgFront.message;
			msg.type = msgFront.type;

			msg = await this.chatService.addMessage(msg);
			const newMsgFront: MessageFront = msg.toFront(user, null);
			const channelFront: ChannelFront = await channel.toFront(this.chatService, user, [user]);
			await channel.sendMessageFrom(this.socketService, user, "chatChannelMessage", channelFront, newMsgFront, user);

			return [ channelFront , newMsgFront ] ;
		} catch (err) {
			throw new WsException(err.message);
		}
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatDiscussionHide')
	async chatDiscuHide(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const targetId: number = body[0];
		const user: User = req.user;

		let discu: Discussion = await this.chatService.findDiscussion(user.id, targetId);
		if (!discu) {
			throw new WsException('You never talked to her/him.');
		}

		this.chatService.hideDiscussion(user, discu);
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelDelete')
	async chatChannelDelete(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const channelDTO: ChannelFront = body[0];
		const user: User = req.user;

		let channel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);

		channel.checkAdminPermission(user);
		//await channel.sendMessageFrom(this.socketService, user, "chatChannelDelete", channel, user);

		this.chatService.deleteChannel(channel);
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelJoin')
	async chatChannelJoin(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req): Promise<ChannelFront> {
		const channelDTO: ChannelFront = body[0];
		const joinedUser: User = req.user;

		let channel: Channel = await this.chatService.fetchChannel(joinedUser, channelDTO.id, channelDTO.type);

		if (channel.banned_ids && channel.banned_ids.indexOf(joinedUser.id) !== -1) {
			throw new WsException(`You are banned in channel ${channel.name}.`);
		} else if (channel instanceof ChannelProtected && channel.password) {
			const password: string | null = body.length > 2 ? body[2] : undefined;
			if (!await comparePassword(password, channel.password)) {
				throw new WsException(`Bad password '${password}' for channel ${channel.name}.`);
			}
		} else if (channel instanceof ChannelPrivate) {
			throw new WsException(`You are not part of the channel ${channel.name}.`);
		}
		channel = await this.chatService.joinChannel(joinedUser, channel);
		const channelFront = await channel.toFront(this.chatService, joinedUser, [joinedUser]);

		await channel.sendMessage(this.socketService, 'chatChannelJoin', channelFront);

		return channel.toFront(this.chatService, joinedUser, [joinedUser]);
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelLeave')
	async chatChannelLeave(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const channelDTO: ChannelFront = body[0];
		const leaveUser: User = req.user;

		let channel: Channel = await this.chatService.fetchChannel(leaveUser, channelDTO.id, channelDTO.type);

		const tmpChannel = await this.chatService.leaveChannel(leaveUser, channel);
		if (!tmpChannel) {
			const channelFront = await channel.toFront(this.chatService, leaveUser, [leaveUser]);
			await channel.sendMessageFrom(this.socketService, leaveUser, 'chatChannelDelete', channelFront);
			return [true];
		}
		channel = tmpChannel;

		const channelFront = await channel.toFront(this.chatService, leaveUser, [leaveUser]);

		await channel.sendMessageFrom(this.socketService, leaveUser, 'chatChannelLeave', channelFront);
		return [true];
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelInvitation')
	async chatChannelInvitation(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const channelDTO: ChannelFront = body[0];
		const invitedUsersDTO: User[] = body[1];

		const user: User = req.user;
		let channelTmp: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);

		if (!(channelTmp instanceof ChannelPrivate))
			throw new WsException("Channel is not private, can't invite users.");

		let channel: ChannelPrivate = channelTmp as ChannelPrivate;
		channel.checkAdminPermission(user);
		const users: User[] = await this.userService.findMany(invitedUsersDTO.map(user => user.id));

		channel = await this.chatService.inviteUsers(channel, users.map(user => user.id));

		await this.chatService.createAutoMsg(`⚪️　${users.map(u => u.username).join(', ')} ${users.length === 1 ? 'have' : 'has'} been added to ${channel.name} by ${user.username}.`, channel);

		const channelFront = await channel.toFront(this.chatService, user, [...users, user]);

		await channel.sendMessage(this.socketService, 'chatChannelInvitation', channelFront);
		await this.socketService.emitIds(user, users.map(user => user.id), 'chatChannelInvitation', channelFront, user);

		return [channelFront];
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelBan')
	async chatChannelBan(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const channelDTO: ChannelFront = body[0];
		const newBanned:{ list: User[], userWhoSelect: User} = body[1];
		const user: User = req.user;

		let channel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);

		channel.checkAdminPermission(user);
		const users: User[] = await this.userService.findMany(newBanned.list.map(user => user.id));
		newBanned.list = users;
		newBanned.userWhoSelect = user;
		channel = await this.chatService.kickUsers(channel, user, users.map(user => user.id)); // TODO optimize

		const channelFront: ChannelFront = await this.chatService.setBanned(channel, user, users);

		await channel.sendMessageFrom(this.socketService, user, 'chatChannelBan', channelFront, newBanned);
		await this.socketService.emitIds(user, users.map(user => user.id), 'chatChannelBan', channelFront, newBanned);
		return [channelFront];
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelAdmin')
	async chatChannelAdmin(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const channelDTO: ChannelFront = body[0];
		const newAdmin:{ list: User[], userWhoSelect: User} = body[1];
		const user: User = req.user;

		let channel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);

		channel.checkAdminPermission(user);
		const users: User[] = await this.userService.findMany(newAdmin.list.map(user => user.id));
		const channelFront: ChannelFront = await this.chatService.setAdmin(channel, user, users);

		
		await channel.sendMessageFrom(this.socketService, user, 'chatChannelAdmin', channelFront);
		return [channelFront];
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelMute')
	async chatChannelMute(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const channelDTO: ChannelFront = body[0];
		const newMuted:{ list: User[], userWhoSelect: User} = body[1];
		const user: User = req.user;

		let channel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);

		channel.checkAdminPermission(user);
		const users: User[] = await this.userService.findMany(newMuted.list.map(user => user.id));

		const channelFront: ChannelFront = await this.chatService.setMuted(channel, user, users);
		await channel.sendMessageFrom(this.socketService, user, 'chatChannelMute', channelFront);
		return [channelFront];
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelKick')
	async chatChannelKick(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const channelDTO: ChannelFront = body[0];
		const newKicked:{ list: User[], userWhoSelect: User} = body[1];
		const user: User = req.user;

		let channel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);

		channel.checkAdminPermission(user);
		const users: User[] = await this.userService.findMany(newKicked.list.map(user => user.id));
		newKicked.list = users;
		newKicked.userWhoSelect = user;
		channel = await this.chatService.kickUsers(channel, user, users.map(user => user.id));

		let leaveMessage: Message = await this.chatService.createAutoMsg(`🔴　${users.map(user => user.username).join(', ')} ${users.length === 1 ? 'have' : 'has'} been kicked by ${user.username}.`, channel);
		

		const channelFront: ChannelFront = await channel.toFront(this.chatService, user, [...users, user]);
		await channel.sendMessageFrom(this.socketService, user, 'chatChannelKick', channelFront, newKicked);
		await this.socketService.emitIds(user, users.map(user => user.id), 'chatChannelKick', channelFront, newKicked);

		await channel.sendMessage(this.socketService, 'chatChannelMessage', leaveMessage.toFront(user, null));
		return [channelFront];
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatPassCheck')
	async chatPassCheck(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req): Promise<boolean> {
		const channelDTO: ChannelFront = body[0];
		const password: string = body[1];
		const user: User = req.user;
		let tempChannel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);
		if (!(tempChannel instanceof ChannelProtected && tempChannel.password)) {
			throw new WsException(`${channelDTO.name} is not a protected channel.`);
		}
		const channel: ChannelProtected = tempChannel as ChannelProtected;

		return comparePassword(password, channel.password)
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelOtherUsers')
	async chatChannelOtherUsers(@MessageBody() body: any, @ConnectedSocket() client: Socket, @Req() req) {
		const channelDTO: ChannelFront = body;
		const user: User = req.user;

		let channel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);

		if (!channel.hasAdminPermission(user))
			throw new ForbiddenException("You can't fetch other users, because you are not admin.");

		let usersExceptInChannel: User[] = await this.userService.findAll();
		usersExceptInChannel = usersExceptInChannel.filter((user: User) => {
			return (!channel.users_ids || channel.users_ids.indexOf(user.id) === -1) && (!channel.banned_ids || channel.banned_ids.indexOf(user.id) === -1);
		});
			// const userBanned = usersExceptInChannel.filter((user: User) => channel.banned_ids.indexOf(user.id) === -1)
		return usersExceptInChannel;
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatMsgReaded')
	async chatMsgReaded(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const user: User = req.user;
		const idMsg: number = body[0];
		const idChannel: number = body[1];

		let msg: Message = await this.chatService.findMessage(idMsg);
		if (!msg) {
			Logger.error(`Can't read a message for ${user.username} with msg id ${idMsg}.`);
			throw new WsException(`Unable to find message ${idMsg} in channel ${idChannel}.`);
		}
		await this.chatService.setReadMessage(user, idChannel, msg);
	}

	/*@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatFindAll')
	async chatFindAll(@MessageBody() body: any, @ConnectedSocket() client: Socket, @Req() req): Promise<any[]> {
		const user: User = req.user;
		const userCached: User[] = new Array();

		let channelsFront: ChannelFront[] = await this.chatService.findUserChannel(user, userCached);
		let discussionFront: DiscussionFront[] = await this.chatService.findUserDiscussion(user, userCached);

		return [discussionFront, channelsFront];
	}*/

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelNamePassword')
	async editChannel(@MessageBody() body: any, @ConnectedSocket() client: Socket, @Req() req) {
		const user: User = req.user;
		const channelDTO: ChannelFront = body[0];
		const newNamePassword: { name: string | null, password: string | null | undefined, userWhoChangeName: User } = body[1];
		let channel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);
		const oldId = channel.id;

		if (newNamePassword.name !== channel.name)
			await this.chatService.createAutoMsg(`⚪️　 ${user.username} change the channel name to ${newNamePassword.name}.`, channel);

		channel = await this.chatService.updateChannel(channel, newNamePassword.name, newNamePassword.password, user);
		const channelFront: ChannelFront = await channel.toFront(this.chatService, user, [user]);
		await channel.sendMessageFrom(this.socketService, user, 'chatChannelNamePassword', channelFront, oldId);
		return [channelFront, channel.id];
	}


		///////////////
		//	MATCH	//
		/////////////

	private matches = this.matchService.getMatches()
	private players_queue = this.matchService.getPlayersQueue()

	@SubscribeMessage('findMatch')
	async handleFindMatch(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<any> {
		console.log("findMatch!", client.id)
		const user = await this.socketService.getUserFromSocket(client)
		const match_found = this.matchService.findUserToPlay(data.type)
		if (match_found) {
			this.matchService.removePlayerFromQueue(match_found.user.id)
			let custom_match_infos = data.type === MatchMakingTypes.OWN_MATCH ? data.custom_match_infos : match_found.custom_match_infos
			var match_id = await this.matchService.createNewMatch(user, match_found.user, custom_match_infos)
			this.matches.get(match_id).room_socket = this.server.to('match_' + match_id)
			client.emit('foundMatch', match_id)
			this.socketService.getSocketToEmit(match_found.user.id).emit('foundMatch', match_id)
		}
		else this.matchService.addPlayerToQueue(user.id, {user: user, match_type: data.type, custom_match_infos: data.custom_match_infos})
	}
	@SubscribeMessage('cancelFindMatch')
	async cancelFindMatch(@ConnectedSocket() client: Socket): Promise<void> {
		const user = await this.socketService.getUserFromSocket(client)
		if (this.players_queue.has(user.id)) this.matchService.removePlayerFromQueue(user.id)
	}

	@SubscribeMessage('joinMatch')
	handleJoinMatch(@MessageBody() id: string, @ConnectedSocket() client: Socket) {
		// once the match is created: for players and spectators
		console.log("joinMatch :", id, "!", client.id)
		if (this.matches.has(id)) {
			let stageWidth = this.matchService.getStageWidth()
			let match = this.matches.get(id)
			let started = match.started
			let waiting = match.waiting
			let racketSize = match.racketSize
			// let ballXPos = match.ballXPos
			// let ballYPos = match.ballYPos
			let p1Ready = match.p1Ready
			let p2Ready = match.p2Ready
			let p1Pos = match.p1Pos
			let p2Pos = match.p2Pos
			client.join('match_' + id)
			const clients = this.server.sockets.adapter.rooms.get('match_' + id);
			console.log("match_" + id, "nb clients = ", clients.size)
			// if (started)
				// return { stageWidth, started, waiting, ballXPos, ballYPos, p1Ready, p2Ready, p1Pos, p2Pos }
			return { stageWidth, started, waiting, racketSize, p1Ready, p2Ready, p1Pos, p2Pos }
		}
	}

	@SubscribeMessage('readyToPlay')
	async handleReadyPlayerFromMatch(@MessageBody() id: string, @ConnectedSocket() client: Socket) {
		const user = await this.socketService.getUserFromSocket(client)
		const match = this.matches.get(id)
		if (match.user1_id === user.id)
			match.p1Ready = true
		else if (match.user2_id === user.id)
			match.p2Ready = true
		if (!match.started && match.p1Ready && match.p2Ready)
		{
			console.log("match ", id, "ready !")
			match.started = true
			this.matchService.startMatch(match)
		}
	}

	@SubscribeMessage('p1Pos')
	updatePlayer1Pos(@MessageBody() data: {id: string, pos: number}, @ConnectedSocket() client: Socket) {
		const match = this.matches.get(data.id)
		if (match !== undefined) {
			if (client === this.socketService.getSocketToEmit(match.user1_id))
				match.p1Pos = data.pos
		}
	}

	@SubscribeMessage('p2Pos')
	updatePlayer2Pos(@MessageBody() data: {id: string, pos: number}, @ConnectedSocket() client: Socket) {
		const match = this.matches.get(data.id)
		if (match !== undefined) {
			if (client === this.socketService.getSocketToEmit(match.user2_id))
				match.p2Pos = data.pos
		}
	}

	@SubscribeMessage('leaveMatch')
	async handleLeaveMatch(@MessageBody() id: string, @ConnectedSocket() client: Socket) {
		let match = this.matches.get(id)
		let user = await this.socketService.getUserFromSocket(client)
		if (match) {
			if (match.started && this.matchService.isUserPlayerFromMatch(user.id, match)) {
				match.stopMatch = true
				await this.matchService.endMatch(match, user.id)
			}
			else {
				if (!match.started) {
					if (user.id === match.user1_id)
						match.p1Ready = false
					else if (user.id === match.user2_id)
						match.p2Ready = false
				}
				client.leave("match_" + match.id)
			}
		}
	}

	// UpdateLeaderboard
	// AdduUserLeaderboard
}
