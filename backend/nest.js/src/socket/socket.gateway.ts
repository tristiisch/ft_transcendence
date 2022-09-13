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
import { Message, MessageFront } from 'chat/entity/message.entity';

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
	handleChatMessage(@MessageBody() discussion: any, @MessageBody() message: any, @ConnectedSocket() client: Socket): any {
		console.log(discussion);
		//console.log(message)
		client.broadcast.emit("chatDiscussionMessage", discussion, message);
	}

	@SubscribeMessage('chatChannelCreate')
	async createChannel(@MessageBody() body: any, @ConnectedSocket() client: Socket): Promise<Channel> {
		// try {
			// const user: User | null = await this.socketService.getUserFromSocket(client);
			const user: User = body[0];
			const channelDTO: ChannelCreateDTO = body[1];
			return await this.chatService.createChannel(user, channelDTO);
		// } catch (err) {
		// 	throw new WsException(err.message);
		// }
	}

	@SubscribeMessage('chatChannelMessage')
	async receiveMessage(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
		const channel: ChannelFront = body[0];
		const msgFront: MessageFront = body[1];
		try {
			const msg: Message = {
				id_sender: msgFront.idSender,
				id_channel: channel.id,
				message: msgFront.message
			};
			return await this.chatService.addMessage(msg);
		} catch (err) {
			throw new WsException(err.message);
		}
	}

}
