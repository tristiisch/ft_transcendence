import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';

@WebSocketGateway({
	cors: {
		origin: `${process.env.FRONT_PREFIX}://${process.env.FRONT_HOST}:${process.env.FRONT_PORT}`
	}
})

export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(
		private socketService: SocketService
	) {}

	afterInit(server: Server): void {
		this.socketService.server = server;
	}

	async handleConnection(clientSocket: Socket) {
		console.log('[SOCKET.IO]', 'SERVER', 'new connection id =>', clientSocket.id, 'with jwt =>', clientSocket.handshake.auth.token);
		const user = await this.socketService.getUserFromSocket(clientSocket);
		if (!user) return clientSocket.disconnect();
		else this.socketService.saveClientSocket(user, clientSocket.id)
	}

	async handleDisconnect(clientSocket: Socket) {
		const user = await this.socketService.getUserFromSocket(clientSocket);
		this.socketService.usersSocket.delete(user.id)
	}

	@SubscribeMessage('test')
	handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket): string {
		console.log(client.id)
		return data;
	}

	@SubscribeMessage('chatDiscussionMessage')
	handleChatMessage(@MessageBody() discussion: any, @MessageBody() message: any, @ConnectedSocket() client: Socket): any {
		console.log(discussion)
		//console.log(message)
		client.broadcast.emit("chatDiscussionMessage", discussion, message);
	}
}