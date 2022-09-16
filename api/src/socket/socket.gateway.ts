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
import { ChatService } from '../chat/chat.service';
import { ChannelCreateDTO } from '../chat/entity/channel-dto';
import { Channel, ChannelFront, ChannelPrivate, ChannelProtected } from '../chat/entity/channel.entity';
import { Server, Socket } from 'socket.io';
import { User } from '../users/entity/user.entity';
import { SocketService } from './socket.service';
import { Message, MessageFront } from '../chat/entity/message.entity';
import { ChatFront, ChatStatus } from '../chat/entity/chat.entity';
import { Discussion, DiscussionFront } from '../chat/entity/discussion.entity';
import { ForbiddenException, forwardRef, Inject, NotAcceptableException, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { comparePassword } from '../utils/bcrypt';
import { JwtSocketGuard } from './strategy/jwt-socket.strategy';
import { UsersService } from 'users/users.service';
import { AuthService } from 'auth/auth.service';

@WebSocketGateway({
	cors: {
		origin: `${process.env.FRONT_URL}`
	}
})

export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	debug: boolean = false;

	constructor(
		private socketService: SocketService,
		@Inject(forwardRef(() => ChatService))
		private readonly chatService: ChatService,
		@Inject(forwardRef(() => UsersService))
		private readonly userService: UsersService,
		@Inject(forwardRef(() => AuthService))
		private readonly authService: AuthService,
	) {}

	afterInit(server: Server): void {
		this.socketService.server = server;
	}

	async handleConnection(clientSocket: Socket) {
		if (this.debug)
			console.log('[SOCKET.IO]', 'SERVER DEBUG', 'new connection id =>', clientSocket.id, 'with jwt =>', clientSocket.handshake.auth.token);
		const user = await this.socketService.getUserFromSocket(clientSocket);
		if (!user) return clientSocket.disconnect();
		else this.socketService.saveClientSocket(user, clientSocket.id);
	}

	async handleDisconnect(clientSocket: Socket) {
		const user = await this.socketService.getUserFromSocket(clientSocket);
		this.socketService.deleteClientSocket(user.id);
	}


	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('test')
	handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket, @Req() req): string {
		// if (this.debug)
		console.log('[SOCKET.IO]', 'SERVER', 'DEBUG', 'client id :', client.id, req.user.username);
		return data;
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelCreate')
	async createChannel(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req): Promise<ChannelFront> {
		// const user: User = body[0];
		const user: User = req.user;
		const channelDTO: ChannelCreateDTO = body[1];
		try {
			const channel: Channel = await this.chatService.createChannel(user, channelDTO);
			return await channel.toFront(this.chatService, user, [user]);
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
		if (this.debug)
			console.log('[SOCKET.IO]', 'SERVER', 'chatDiscussionCreate', 'Discussion:', newDiscu);
		const finalDiscu: Discussion = await this.chatService.fetchChat(user, newDiscu.id, newDiscu.type) as Discussion;
		return finalDiscu.toFront(this.chatService, user, [user]);
	}


	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatDiscussionMessage')
	async chatDiscussionMessage(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const user: User = req.user;
		const discussion: DiscussionFront = body[0];
		const message: MessageFront = body[1];

		message.idSender = user.id;

		let tempDiscu: Discussion = await this.chatService.findOrCreateDiscussion(message.idSender, discussion.user['id']);
		try {
			let msg: Message = new Message();
			msg.id_sender = message.idSender;
			msg.id_channel = tempDiscu.id;
			msg.message = message.message;

			msg = await this.chatService.addMessage(msg);
			const msgFront: MessageFront = msg.toFront();
			const discuFront: DiscussionFront = await tempDiscu.toFront(this.chatService, user, [user]);

			tempDiscu.sendMessage(this.socketService, user, 'chatDiscussionMessage', discuFront, msgFront);
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
		const channelDTO: ChannelFront = body[0];
		const msgFront: MessageFront = body[1];

		if (channelDTO.id == null) // TODO fix: je sais pas quand on vient de crée le channel, c'est null 
			throw new WsException(`channel.id = ${channelDTO.id} so msg ${msgFront} can't be send`);

		msgFront.idSender = user.id;
		const channel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);
		if (channel.banned_ids && channel.banned_ids.indexOf(user.id) !== -1) {
			throw new UnauthorizedException(`You are banned in channel ${channel.name}`);
		} else if (channel.muted_ids && channel.muted_ids.indexOf(user.id) !== -1) {
			throw new ForbiddenException(`You are mute in channel ${channel.name}`);
		}
		try {
			let msg: Message = new Message();
			msg.id_sender = user.id;
			msg.id_channel =  channel.id;
			msg.message = msgFront.message;

			msg = await this.chatService.addMessage(msg);
			const newMsgFront: MessageFront = msg.toFront();
			channel.sendMessageExcept(this.socketService, user, "chatChannelMessage", channel, newMsgFront);
			// client.broadcast.emit("chatChannelMessage", channel, newMsgFront);
			return [ channel, newMsgFront ];
		} catch (err) {
			throw new WsException(err.message);
		}
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelDelete')
	async chatChannelDelete(@MessageBody() body: any[], @ConnectedSocket() client: Socket) {
		const channel: ChannelFront = body[0];
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
		} else if (channel instanceof ChannelPrivate && channel.invited_ids.indexOf(joinedUser.id) === -1) {
			throw new WsException(`You are not part of the channel ${channel.name}.`);
		}
		channel = await this.chatService.joinChannel(joinedUser, channel);
		return channel.toFront(this.chatService, joinedUser, [joinedUser]);
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelLeave')
	async chatChannelLeave(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req): Promise<ChannelFront> {
		const channelDTO: ChannelFront = body[0];
		const leaveUser: User = req.user;

		let channel: Channel = await this.chatService.fetchChannel(leaveUser, channelDTO.id, channelDTO.type);

		channel = await this.chatService.leaveChannel(leaveUser, channel);
		return channel.toFront(this.chatService, leaveUser, [leaveUser]);
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelInvitation')
	async chatChannelInvitation(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const channelDTO: ChannelFront = body[0];
		const invitedUsers: User[] = body[1];
		// const inviter: User = body[2];
		const user: User = req.user;
		let channelTmp: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);

		if (!(channelTmp instanceof ChannelPrivate))
			throw new WsException("Channel is not private, can't invite users.");

		let channel: ChannelPrivate = channelTmp as ChannelPrivate;
		channel.checkAdminPermission(user);
		const users: User[] = await this.userService.findMany(body.map(user => user.id));
		channel = await this.chatService.inviteUsers(channel, users.map(user => user.id));

		return channel;
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelBan')
	async chatChannelBan(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const channelDTO: ChannelFront = body[0];
		const newBanned:{ list: User[], userWhoSelect: User} = body[1];
		const user: User = req.user;

		let channel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);

		channel.checkAdminPermission(user);
		const users: User[] = await this.userService.findMany(newBanned['list'].map(user => user.id));
		channel = await this.chatService.setBanned(channel, users.map(user => user.id));

		return channel;
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelAdmin')
	async chatChannelAdmin(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const channelDTO: ChannelFront = body[0];
		const newAdmin:{ list: User[], userWhoSelect: User} = body[1];
		const user: User = req.user;

		let channel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);

		channel.checkAdminPermission(user);
		const users: User[] = await this.userService.findMany(newAdmin['list'].map(user => user.id));
		channel = await this.chatService.setAdmin(channel, users.map(user => user.id));

		return channel;
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelMute')
	async chatChannelMute(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const channelDTO: ChannelFront = body[0];
		const newMuted:{ list: User[], userWhoSelect: User} = body[1];
		const user: User = req.user;

		let channel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);

		channel.checkAdminPermission(user);
		const users: User[] = await this.userService.findMany(newMuted['list'].map(user => user.id));
		channel = await this.chatService.setMuted(channel, users.map(user => user.id));

		return channel;
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelKick')
	async chatChannelKick(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const channelDTO: ChannelFront = body[0];
		const newKicked:{ list: User[], userWhoSelect: User} = body[1];
		const user: User = req.user;

		let channel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);

		channel.checkAdminPermission(user);
		const users: User[] = await this.userService.findMany(newKicked['list'].map(user => user.id));
		channel = await this.chatService.kickUsers(user, channel, users.map(user => user.id));

		return channel;
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelName')
	async chatChannelName(@MessageBody() body: any[], @ConnectedSocket() client: Socket) {
		const channelDTO: ChannelFront = body[0];
		const newName: { name: string, userWhoChangeName: User} = body[1];
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatPassCheck')
	async chatPassCheck(@MessageBody() body: any[], @ConnectedSocket() client: Socket): Promise<boolean> {
		const channelDTO: ChannelFront = body[0];
		const password: string = body[1];
		return comparePassword(password, channelDTO.password)
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatChannelOtherUsers')
	async chatChannelOtherUsers(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const channelDTO: ChannelFront = body[0];
		const user: User = req.user;
	
		let channel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);

		if (channel.admins_ids.indexOf(user.id) === -1)
			throw new ForbiddenException("You can't fetch other users, because you are not admin.");

		let usersExceptInChannel: User[] = await this.userService.findAll();
		usersExceptInChannel = usersExceptInChannel.filter((user: User) => channel.users_ids.indexOf(user.id) === -1 && channel.banned_ids.indexOf(user.id) === -1)
		// const userBanned = usersExceptInChannel.filter((user: User) => channel.banned_ids.indexOf(user.id) === -1)
		return usersExceptInChannel;
	}

	@UseGuards(JwtSocketGuard)
	@SubscribeMessage('chatMsgReaded')
	async chatMsgReaded(@MessageBody() body: any[], @ConnectedSocket() client: Socket, @Req() req) {
		const user: User = req.user;
		// TODO
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
}
