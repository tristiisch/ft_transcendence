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
import { ForbiddenException, NotAcceptableException, UnauthorizedException } from '@nestjs/common';
import { comparePassword } from '../utils/bcrypt';

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
		private readonly chatService: ChatService
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
		this.socketService.usersSocket.delete(user.id);
	}

	@SubscribeMessage('test')
	handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket): string {
		// if (this.debug)
		console.log('[SOCKET.IO]', 'SERVER', 'DEBUG', 'client id :', client.id);
		return data;
	}

	@SubscribeMessage('chatChannelCreate')
	async createChannel(@MessageBody() body: any[], @ConnectedSocket() client: Socket): Promise<ChannelFront> {
		// const user: User = body[0];
		const user = await this.socketService.getUserFromSocket(client);
		const channelDTO: ChannelCreateDTO = body[1];
		try {
			const channel: Channel = await this.chatService.createChannel(user, channelDTO);
			return await channel.toFront(this.chatService, user, [user]);
		} catch (err) {
			throw new WsException(err.message);
		}
	}

	@SubscribeMessage('chatDiscussionCreate')
	async chatDiscussionCreate(@MessageBody() body: any[], @ConnectedSocket() client: Socket): Promise<DiscussionFront> {
		// const user: User = body[0];
		const user = await this.socketService.getUserFromSocket(client);
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


	@SubscribeMessage('chatDiscussionMessage')
	async chatDiscussionMessage(@MessageBody() body: any[], @ConnectedSocket() client: Socket): Promise<any[]> {
		const user = await this.socketService.getUserFromSocket(client);
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
			const discuFront: DiscussionFront = await tempDiscu.toFront(this.chatService, user, [user, discussion.user]);
			client.broadcast.emit("chatDiscussionMessage", discussion, msgFront);
			return [msgFront, discuFront];
		} catch (err) {
			throw new WsException(err.message);
		}
	}

	@SubscribeMessage('chatChannelMessage')
	async chatChannelMessage(@MessageBody() body: any[], @ConnectedSocket() client: Socket): Promise<MessageFront> {
		const user = await this.socketService.getUserFromSocket(client);
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
			client.broadcast.emit("chatChannelMessage", channel, newMsgFront);
			return newMsgFront;
		} catch (err) {
			throw new WsException(err.message);
		}
	}

	@SubscribeMessage('chatChannelDelete')
	async chatChannelDelete(@MessageBody() body: any[], @ConnectedSocket() client: Socket) {
		const channel: ChannelFront = body[0];
	}

	@SubscribeMessage('chatChannelJoin')
	async chatChannelJoin(@MessageBody() body: any[], @ConnectedSocket() client: Socket): Promise<ChannelFront> {
		const channelDTO: ChannelFront = body[0];
		// const joinedUser: User = body[1];
	
		const joinedUser: User = await this.socketService.getUserFromSocket(client);

		let channel: Channel = await this.chatService.fetchChannel(joinedUser, channelDTO.id, channelDTO.type);

		if (channel.banned_ids && channel.banned_ids.indexOf(joinedUser.id) !== -1) {
			throw new UnauthorizedException(`You are banned in channel ${channel.name}.`);
		} else if (channel instanceof ChannelProtected && channel.password) {
			const password: string | null = body.length > 2 ? body[2] : undefined;
			if (!await comparePassword(password, channel.password)) {
				throw new UnauthorizedException(`Bad password '${password}' for channel ${channel.name}.`);
			}
		} else if (channel instanceof ChannelPrivate && channel.invited_ids.indexOf(joinedUser.id) === -1) {
			throw new UnauthorizedException(`You are not part of the channel ${channel.name}.`);
		}
		channel = await this.chatService.joinChannel(joinedUser, channel);
		return channel.toFront(this.chatService, joinedUser, [joinedUser]);
	}

	@SubscribeMessage('chatChannelLeave')
	async chatChannelLeave(@MessageBody() body: any[], @ConnectedSocket() client: Socket): Promise<ChannelFront> {
		const channelDTO: ChannelFront = body[0];
		// const joinedUser: User = body[1];
	
		const leaveUser: User = await this.socketService.getUserFromSocket(client);

		let channel: Channel = await this.chatService.fetchChannel(leaveUser, channelDTO.id, channelDTO.type);

		channel = await this.chatService.leaveChannel(leaveUser, channel);
		return channel.toFront(this.chatService, leaveUser, [leaveUser]);
	}

	@SubscribeMessage('chatChannelInvitation')
	async chatChannelInvitation(@MessageBody() body: any[], @ConnectedSocket() client: Socket) {
		const channelDTO: ChannelFront = body[0];
		const invitedUsers: User[] = body[1];
		// const inviter: User = body[2];
		const clientUser: User = await this.socketService.getUserFromSocket(client);
		let channelTmp: Channel = await this.chatService.fetchChannel(clientUser, channelDTO.id, channelDTO.type);

		if (!(channelTmp instanceof ChannelPrivate))
			throw new WsException("Channel is not private, can't invite users.");

		let channel: ChannelPrivate = channelTmp as ChannelPrivate;
		channel.checkAdminPermission(clientUser);
		const users: User[] = await this.chatService.getUserService().findMany(body.map(user => user.id));
		channel = await this.chatService.inviteUsers(channel, users.map(user => user.id));

		return channel;
	}

	@SubscribeMessage('chatChannelBan')
	async chatChannelBan(@MessageBody() body: any[], @ConnectedSocket() client: Socket) {
		const channelDTO: ChannelFront = body[0];
		const newBanned:{ list: User[], userWhoSelect: User} = body[1];
		const clientUser: User = await this.socketService.getUserFromSocket(client);
		let channel: Channel = await this.chatService.fetchChannel(clientUser, channelDTO.id, channelDTO.type);

		channel.checkAdminPermission(clientUser);
		const users: User[] = await this.chatService.getUserService().findMany(newBanned['list'].map(user => user.id));
		channel = await this.chatService.setBanned(channel, users.map(user => user.id));

		return channel;
	}

	@SubscribeMessage('chatChannelAdmin')
	async chatChannelAdmin(@MessageBody() body: any[], @ConnectedSocket() client: Socket) {
		const channelDTO: ChannelFront = body[0];
		const newAdmin:{ list: User[], userWhoSelect: User} = body[1];
	
		const clientUser: User = await this.socketService.getUserFromSocket(client);
		let channel: Channel = await this.chatService.fetchChannel(clientUser, channelDTO.id, channelDTO.type);

		channel.checkAdminPermission(clientUser);
		const users: User[] = await this.chatService.getUserService().findMany(newAdmin['list'].map(user => user.id));
		channel = await this.chatService.setBanned(channel, users.map(user => user.id));

		return channel;
	}

	@SubscribeMessage('chatChannelMute')
	async chatChannelMute(@MessageBody() body: any[], @ConnectedSocket() client: Socket) {
		const channelDTO: ChannelFront = body[0];
		const newMuted:{ list: User[], userWhoSelect: User} = body[1];
	
		const clientUser: User = await this.socketService.getUserFromSocket(client);
		let channel: Channel = await this.chatService.fetchChannel(clientUser, channelDTO.id, channelDTO.type);

		channel.checkAdminPermission(clientUser);
		const users: User[] = await this.chatService.getUserService().findMany(newMuted['list'].map(user => user.id));
		channel = await this.chatService.setMuted(channel, users.map(user => user.id));

		return channel;
	}

	@SubscribeMessage('chatChannelKick')
	async chatChannelKick(@MessageBody() body: any[], @ConnectedSocket() client: Socket) {
		const channelDTO: ChannelFront = body[0];
		const newKicked:{ list: User[], userWhoSelect: User} = body[1];
	
		const clientUser: User = await this.socketService.getUserFromSocket(client);
		let channel: Channel = await this.chatService.fetchChannel(clientUser, channelDTO.id, channelDTO.type);

		channel.checkAdminPermission(clientUser);
		const users: User[] = await this.chatService.getUserService().findMany(newKicked['list'].map(user => user.id));
		channel = await this.chatService.kickUsers(clientUser, channel, users.map(user => user.id));

		return channel;
	}

	@SubscribeMessage('chatChannelName')
	async chatChannelName(@MessageBody() body: any[], @ConnectedSocket() client: Socket) {
		const channelDTO: ChannelFront = body[0];
		const newName: { name: string, userWhoChangeName: User} = body[1];
	}

	@SubscribeMessage('chatPassCheck')
	async chatPassCheck(@MessageBody() body: any[], @ConnectedSocket() client: Socket): Promise<boolean> {
		const channelDTO: ChannelFront = body[0];
		const password: string = body[1];
		return comparePassword(password, channelDTO.password)
	}

	@SubscribeMessage('chatChannelOtherUsers')
	async chatChannelOtherUsers(@MessageBody() body: any[], @ConnectedSocket() client: Socket) {
		const channelDTO: ChannelFront = body[0];
		const user: User = await this.socketService.getUserFromSocket(client);
	
		let channel: Channel = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);

		if (channel.admins_ids.indexOf(user.id) === -1)
			throw new ForbiddenException("You can't fetch other users, because you are not admin.");

		let usersExceptInChannel: User[] = await this.chatService.getUserService().findAll();
		usersExceptInChannel = usersExceptInChannel.filter((user: User) => channel.users_ids.indexOf(user.id) === -1 && channel.banned_ids.indexOf(user.id) === -1)
		// const userBanned = usersExceptInChannel.filter((user: User) => channel.banned_ids.indexOf(user.id) === -1)
		return [usersExceptInChannel];
	}

	@SubscribeMessage('chatFindAll')
	async chatFindAll(@MessageBody() body: any, @ConnectedSocket() client: Socket): Promise<any[]> {
		const user: User = await this.socketService.getUserFromSocket(client);
		const userCached: User[] = new Array();
	
		let channelsFront: ChannelFront[] = await this.chatService.findUserChannel(user, userCached);
		let discussionFront: DiscussionFront[] = await this.chatService.findUserDiscussion(user, userCached);

		return [discussionFront, channelsFront];
	}
}
