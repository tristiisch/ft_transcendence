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
import { Message, MessageFront } from 'chat/entity/message.entity';
import { Chat, ChatFront, ChatStatus } from 'chat/entity/chat.entity';
import { Discussion, DiscussionFront } from 'chat/entity/discussion.entity';
import { ForbiddenException, forwardRef, Inject, Logger, NotAcceptableException, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { comparePassword } from 'utils/bcrypt';
import { JwtSocketGuard } from './strategy/jwt-socket.strategy';
import { UsersService } from 'users/users.service';
import { AuthService } from 'auth/auth.service';
import { MatchStatsService } from 'game/matchs/matchs.service';
import { validate, validateOrReject } from 'class-validator';

@WebSocketGateway({
	cors: {
		origin: `${process.env.FRONT_URL}`
	}
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
		@Inject(forwardRef(() => MatchStatsService))
		private readonly matchStatsService: MatchStatsService
	) {}

	afterInit(server: Server): void {
		this.socketService.server = server;
		this.server.on("connection", (socket) => {
			socket.prependAny((eventName, ...args) => {
				Logger.debug(`Receive ${eventName} => ${JSON.stringify(args)}`, 'WebSocket');
			});
			socket.prependAnyOutgoing((eventName, ...args) => {
				Logger.debug(`Send ${eventName} <= ${JSON.stringify(args)}`, 'WebSocket');
			});
			socket.on("ping", (count) => {
				Logger.debug(`Ping ${count}`, 'WebSocket');
			});
		});
	}

	async handleConnection(clientSocket: Socket) {
		try {
			const user = await this.socketService.getUserFromSocket(clientSocket);

			if (!user) return clientSocket.disconnect();

			Logger.debug(`New connection ${user.username}`, 'WebSocket');
			this.socketService.saveClientSocket(user, clientSocket.id);
			this.updateStatus(clientSocket, user, UserStatus.ONLINE);
		} catch (err) {
			Logger.error(`Cannot handle connection ${err.message}`, 'WebSocket');
		}
	}

	async handleDisconnect(clientSocket: Socket) {
		this.handleConnection(clientSocket);
		try {
			const user = await this.socketService.getUserFromSocket(clientSocket);

			Logger.debug(`Disconnection ${user.username}`, 'WebSocket');
			this.updateStatus(clientSocket, user, UserStatus.OFFLINE);
			this.socketService.deleteClientSocket(user.id);
		} catch (err) {
			Logger.error(`Cannot get user from socket for handleDisconnect:  ${err.message}`, 'WebSocket');
		}
	}

	updateStatus(clientSocket: Socket, user: User, status: UserStatus) {
		clientSocket.broadcast.emit('updateUserStatus', ({ id: user.id, status: status }))
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
		try {
			const channel: Channel = await this.chatService.createChannel(user, channelDTO);
			const channelFront: ChannelFront = await channel.toFront(this.chatService, user, [user]);

			channel.sendMessageFrom(this.socketService, user, "chatChannelCreate", channelFront, user);
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
			users_ids: [user.id, discussionFront['user'].id]
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

		messageDTO.idSender = user.id;

		const discu: Discussion = await this.chatService.findOrCreateDiscussion(messageDTO.idSender, targetId);
		try {
			let message: Message = new Message();
			message.id_sender = messageDTO.idSender;
			message.id_channel = discu.id;
			message.message = messageDTO.message;
			message.type = messageDTO.type;

			message = await this.chatService.addMessage(message);
			const msgFront: MessageFront = message.toFront(null);
			const discuFront: DiscussionFront = await discu.toFront(this.chatService, user, [user]);

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
			const newMsgFront: MessageFront = msg.toFront(null);
			channel.sendMessageFrom(this.socketService, user, "chatChannelMessage", channel, newMsgFront, user);
			// client.broadcast.emit("chatChannelMessage", channel, newMsgFront);
			return [ channel, newMsgFront ];
		} catch (err) {
			throw new WsException(err.message);
		}
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelDelete')
	async chatChannelDelete(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const channelDTO: ChannelFront = body[0];
		const user: User = req.user;

		let channel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);

		channel.checkAdminPermission(user);
		//channel.sendMessageFrom(this.socketService, user, "chatChannelDelete", channel, user);

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

		channel.sendMessage(this.socketService, 'chatChannelJoin', channelFront);

		return channel.toFront(this.chatService, joinedUser, [joinedUser]);
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelLeave')
	async chatChannelLeave(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const channelDTO: ChannelFront = body[0];
		const leaveUser: User = req.user;

		let channel: Channel = await this.chatService.fetchChannel(leaveUser, channelDTO.id, channelDTO.type);

		channel = await this.chatService.leaveChannel(leaveUser, channel);
		if (!channel)
			return;
		const channelFront = await channel.toFront(this.chatService, leaveUser, [leaveUser]);

		channel.sendMessageFrom(this.socketService, leaveUser, 'chatChannelLeave', channelFront);
		return [null];
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelInvitation')
	async chatChannelInvitation(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const channelDTO: ChannelFront = body[0];
		const invitedUsers: User[] = body[1];
		const user: User = req.user;
		let channelTmp: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);

		if (!(channelTmp instanceof ChannelPrivate))
			throw new WsException("Channel is not private, can't invite users.");

		let channel: ChannelPrivate = channelTmp as ChannelPrivate;
		channel.checkAdminPermission(user);
		const users: User[] = await this.userService.findMany(invitedUsers.map(user => user.id));
		channel = await this.chatService.inviteUsers(channel, users.map(user => user.id));

		const channelFront = await channel.toFront(this.chatService, user, [...users, user]);

		channel.sendMessage(this.socketService, 'chatChannelInvitation', channelFront);
		this.socketService.emitIds(users.map(user => user.id), 'chatChannelInvitation', channelFront, user);

		return channelFront;
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
		channel = await this.chatService.setBanned(channel, users.map(user => user.id));
		channel = await this.chatService.kickUsers(user, channel, users.map(user => user.id)); // TODO optimize

		const channelFront: ChannelFront = await channel.toFront(this.chatService, user, [...users, user]);

		channel.sendMessageFrom(this.socketService, user, 'chatChannelBan', channelFront, newBanned);
		return channelFront;
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
		channel = await this.chatService.setAdmin(channel, users.map(user => user.id));

		const channelFront: ChannelFront = await channel.toFront(this.chatService, user, [...users, user]);
		channel.sendMessageFrom(this.socketService, user, 'chatChannelAdmin', channelFront);
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
		channel = await this.chatService.setMuted(channel, users.map(user => user.id));

		const channelFront: ChannelFront = await channel.toFront(this.chatService, user, [...users, user]);
		channel.sendMessageFrom(this.socketService, user, 'chatChannelMute', channelFront);
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
		channel = await this.chatService.kickUsers(user, channel, users.map(user => user.id));

		const channelFront: ChannelFront = await channel.toFront(this.chatService, user, [...users, user]);
		channel.sendMessageFrom(this.socketService, user, 'chatChannelKick', channelFront, newKicked);
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


		// let chat: Chat = await this.chatService.findChat(idChannel);
		let msg: Message = await this.chatService.findMessage(idMsg);
		if (!msg) {
			Logger.error(`Can't read a message with ${idMsg} id.`);
			throw new WsException(`Unable to find message ${idMsg} in channel ${idChannel}.`);
		}
		await this.chatService.setReadMessage(user, idChannel, msg)
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatFindAll')
	async chatFindAll(@MessageBody() body: any, @ConnectedSocket() client: Socket, @Req() req): Promise<any[]> {
		const user: User = req.user;
		const userCached: User[] = new Array();

		let channelsFront: ChannelFront[] = await this.chatService.findUserChannel(user, userCached);
		let discussionFront: DiscussionFront[] = await this.chatService.findUserDiscussion(user, userCached);

		return [discussionFront, channelsFront];
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelNamePassword')
	async editChannel(@MessageBody() body: any, @ConnectedSocket() client: Socket, @Req() req) {
		const user: User = req.user;
		const channelDTO: ChannelFront = body[0];
		const newNamePassword: { name: string | null, password: string | null, userWhoChangeName: User } = body[1];
		let channel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);

		channel = await this.chatService.updateChannel(channel, newNamePassword.name, newNamePassword.password, user);
		const channelFront: ChannelFront = await channel.toFront(this.chatService, user, [user]);
		channel.sendMessageFrom(this.socketService, user, 'chatChannelNamePassword', channelFront)
		return [channelFront];
	}
}
