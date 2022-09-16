import { forwardRef, Inject,Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
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
		private readonly userService: UsersService,
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
		return user;
	}

	saveClientSocket(user: User, clientSocketId: string) {
		if (this.usersSocket.has(user.id)) this.usersSocket[user.id] = clientSocketId
		this.usersSocket.set(user.id, clientSocketId)
	}

	getSocketToEmit(targetId: number) {
		const socketId = this.usersSocket.get(targetId);
		return this.server.sockets.sockets.get(socketId)
	}

	async FriendRequest(targetId: number, notification: NotificationFront) {
		const clientSocket = this.getSocketToEmit(targetId)
		if (clientSocket) clientSocket.emit('FriendRequest', notification.from_user, notification);
	};

	async AddFriend(targetId: number, notification: NotificationFront) {
		const clientSocket = this.getSocketToEmit(targetId)
		if (clientSocket) clientSocket.emit('AddFriend', notification.from_user, notification);
	};

	async RemoveFriend(senderId: number, targetId: number) {
		const clientSocket = this.getSocketToEmit(targetId)
		if (clientSocket) clientSocket.emit('RemoveFriend', senderId)
	};

	AddUser(user: User) {
		const clientSocket = this.getSocketToEmit(user.id)
		clientSocket.broadcast.emit('AddUser', user);
	};
}
