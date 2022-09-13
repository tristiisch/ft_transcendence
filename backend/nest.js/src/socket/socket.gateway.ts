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
import { Channel, ChannelFront } from '../chat/entity/channel.entity';
import { Server, Socket } from 'socket.io';
import { User } from '../users/entity/user.entity';
import { SocketService } from './socket.service';
import { Message, MessageFront } from '../chat/entity/message.entity';
import { ChatFront, ChatStatus } from '../chat/entity/chat.entity';
import { Discussion, DiscussionFront } from '../chat/entity/discussion.entity';
import { NotAcceptableException } from '@nestjs/common';
import { comparePassword } from '../utils/bcrypt';

@WebSocketGateway({
	cors: {
		origin: `${process.env.FRONT_PREFIX}://${process.env.FRONT_HOST}:${process.env.FRONT_PORT}`
	}
})

export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(
		private socketService: SocketService,
		private readonly chatService: ChatService
	) {}

	afterInit(server: Server): void {
		this.socketService.server = server;
	}

	async handleConnection(clientSocket: Socket) {
		console.log('[SOCKET.IO]', 'SERVER', 'new connection id =>', clientSocket.id, 'with jwt =>', clientSocket.handshake.auth.token);
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
		console.log(client.id);
		return data;
	}

	@SubscribeMessage('chatDiscussionMessage')
	async handleChatMessage(@MessageBody() body, @ConnectedSocket() client: Socket): Promise<any> {
		const discussion: DiscussionFront = body[0];
		const message: MessageFront = body[1];
		const tempDiscu: Discussion = await this.chatService.findDiscussion(message.idSender, discussion.user['id']);
		try {
			const msg: Message = {
				id_sender: message.idSender,
				id_channel: tempDiscu.id,
				message: message.message
			};
			await this.chatService.addMessage(msg);
		} catch (err) {
			throw new WsException(err.message);
		}
		client.broadcast.emit("chatDiscussionMessage", discussion, message);
	}

	@SubscribeMessage('chatChannelCreate')
	async createChannel(@MessageBody() body: User, @ConnectedSocket() client: Socket): Promise<ChannelFront> {
		const user: User = body[0];
		const channelDTO: ChannelCreateDTO = body[1];
		// try {
			// const user: User | null = await this.socketService.getUserFromSocket(client);
		return await (await this.chatService.createChannel(user, channelDTO)).toFront(this.chatService, user, null);
		// } catch (err) {
		// 	throw new WsException(err.message);
		// }
	}

	@SubscribeMessage('chatDiscussionCreate')
	async chatDiscussionMessage(@MessageBody() body, @ConnectedSocket() client: Socket): Promise<DiscussionFront> {
		const user: User = body[0];
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
		console.log('DEBUG', newDiscu);
		const finalDiscu: Discussion = await this.chatService.fetchChannel(user, newDiscu.id, newDiscu.type) as Discussion;
		return finalDiscu.toFront(this.chatService, user);
	}

	@SubscribeMessage('chatChannelMessage')
	async chatChannelMessage(@MessageBody() body, @ConnectedSocket() client: Socket) {
		const channel: ChannelFront = body[0];
		const msgFront: MessageFront = body[1];
		try {
			const channelId = channel.id;
			const msg: Message = {
				id_sender: msgFront.idSender,
				id_channel: channelId,
				message: msgFront.message
			};
			if (channelId == null) // TODO fix: je sais pas quand on vient de crée le channel, c'est null 
				throw new WsException(`channel.id = ${channel.id} so msg ${JSON.stringify(msg)} can't be send`);
			await this.chatService.addMessage(msg);
		} catch (err) {
			throw new WsException(err.message);
		}
		client.broadcast.emit("chatChannelMessage", channel, msgFront);
	}

	@SubscribeMessage('chatChannelDelete')
	async chatChannelDelete(@MessageBody() body, @ConnectedSocket() client: Socket) {
		const channel: ChannelFront = body[0];
	}

	@SubscribeMessage('chatChannelJoin')
	async chatChannelJoin(@MessageBody() body, @ConnectedSocket() client: Socket) {
		const channel: ChannelFront = body[0];
		const joinedUser: User = body[1];
	}

	@SubscribeMessage('chatChannelJoin')
	async chatChannelInvitation(@MessageBody() body, @ConnectedSocket() client: Socket) {
		const channel: ChannelFront = body[0];
		const invitedUsers: User[] = body[1];
		const inviter: User = body[2];
	}

	@SubscribeMessage('chatChannelLeave')
	async chatChannelLeave(@MessageBody() body, @ConnectedSocket() client: Socket) {
		const channel: ChannelFront = body[0];
		const user: User = body[1];
	}

	@SubscribeMessage('chatChannelBan')
	async chatChannelBan(@MessageBody() body, @ConnectedSocket() client: Socket) {
		const channel: ChannelFront = body[0];
		const newBanned:{ list: User[], userWhoSelect: User} = body[1];
	}

	@SubscribeMessage('chatChannelAdmin')
	async chatChannelAdmin(@MessageBody() body, @ConnectedSocket() client: Socket) {
		const channel: ChannelFront = body[0];
		const newAdmin:{ list: User[], userWhoSelect: User} = body[1];
	}

	@SubscribeMessage('chatChannelMute')
	async chatChannelMute(@MessageBody() body, @ConnectedSocket() client: Socket) {
		const channel: ChannelFront = body[0];
		const newMuted:{ list: User[], userWhoSelect: User} = body[1];
	}

	@SubscribeMessage('chatChannelKick')
	async chatChannelKick(@MessageBody() body, @ConnectedSocket() client: Socket) {
		const channel: ChannelFront = body[0];
		const newKicked:{ list: User[], userWhoSelect: User} = body[1];
	}

	@SubscribeMessage('chatChannelName')
	async chatChannelName(@MessageBody() body, @ConnectedSocket() client: Socket) {
		const channel: ChannelFront = body[0];
		const newName: { name: string, userWhoChangeName: User} = body[1];
	}

	@SubscribeMessage('chatPassCheck')
	async chatPassCheck(@MessageBody() body, @ConnectedSocket() client: Socket) {
		const channel: ChannelFront = body[0];
		const password: string = body[1];
		return comparePassword(body[1], body[0].password)
	}

}
