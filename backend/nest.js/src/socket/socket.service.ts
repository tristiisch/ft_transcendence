import { forwardRef, Inject,Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { Server, Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { WebSocketServer } from '@nestjs/websockets';
import { Notification } from '../notification/entity/notification.entity';
import { User, UserStatus } from '../users/entity/user.entity';

@Injectable()
export class SocketService {
	@WebSocketServer()
	server: Server;

	constructor(
		private readonly authService: AuthService,
	) {}

	usersSocket: Map<number, string> = new Map<number, string>()

	async getUserFromSocket(socket: Socket) {
	const token = socket.handshake.auth.token;
	const user = await this.authService.getUserFromAuthenticationToken(token);
	if (!user) {
		console.log('Invalid credentials.')
		//throw new WsException('Invalid credentials.');
	}
	return user;
	}

	saveClientSocket(user: User, clientSocketId: string) {
		if (!this.usersSocket.has(user.id))
		{
			this.usersSocket.set(user.id, clientSocketId)
			this.AddUser(user)
		}
		else this.usersSocket.set(user.id, clientSocketId)
	}

	getSocketToEmit(targetId: number) {
		const socketID = this.usersSocket.get(targetId);
		return this.server.sockets.sockets.get(socketID)
	}

	FriendRequest(senderId: number, targetId: number, notification: Notification) {
		const clientSocket = this.getSocketToEmit(targetId)
		if (clientSocket) clientSocket.emit('FriendRequest', senderId, notification);
	};

	AddFriend(senderId: number, targetId: number) {
		const clientSocket = this.getSocketToEmit(targetId)
		if (clientSocket) clientSocket.emit('AddFriend', senderId);
	};

	RemoveFriend(senderId: number, targetId: number) {
		const clientSocket = this.getSocketToEmit(targetId)
		if (clientSocket) clientSocket.emit('RemoveFriend', senderId);
	};

	AddUser(user: User) {
		const clientSocket = this.getSocketToEmit(user.id)
		clientSocket.broadcast.emit('AddUser', user);
	};
}
