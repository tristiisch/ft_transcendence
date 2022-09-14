import { forwardRef, Inject,Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { Server, Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { WebSocketServer } from '@nestjs/websockets';
import { Notification, NotificationFront } from '../notification/entity/notification.entity';
import { User, UserStatus } from '../users/entity/user.entity';

@Injectable()
export class SocketService {
	@WebSocketServer()
	server: Server;

	constructor(
		private readonly authService: AuthService,
	) {}

	usersSocket: Map<number, string> = new Map<number, string>()

	async getUserFromSocket(socket: Socket) : Promise<User> {
		const token = socket.handshake.auth.token;
		let user;
		try {
			user = await this.authService.getUserFromAuthenticationToken(token);
		} catch (err) {
			throw new WsException(err.message);
		}
		if (!user) {
			// console.log('Invalid credentials.')
			throw new WsException('Invalid credentials.');
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

	FriendRequest(senderId: number, targetId: number, notification: NotificationFront) {
		const clientSocket = this.getSocketToEmit(targetId)
		if (clientSocket) clientSocket.emit('FriendRequest', senderId, notification);
	};

	AddFriend(senderId: number, targetId: number, notification: NotificationFront) {
		const clientSocket = this.getSocketToEmit(targetId)
		if (clientSocket) clientSocket.emit('AddFriend', senderId, notification);
	};

	RemoveFriend(senderId: number, targetId: number, notification: NotificationFront) {
		const clientSocket = this.getSocketToEmit(targetId)
		if (clientSocket) clientSocket.emit('RemoveFriend', senderId, notification);
	};

	AddUser(user: User) {
		const clientSocket = this.getSocketToEmit(user.id)
		clientSocket.broadcast.emit('AddUser', user);
	};
}
