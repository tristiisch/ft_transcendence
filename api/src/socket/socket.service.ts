import { forwardRef, Inject,Injectable, Logger, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'auth/auth.service';
import { UsersService } from 'users/users.service';
import { Server, Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { WebSocketServer } from '@nestjs/websockets';
import { NotificationFront, NotificationType } from 'notification/entity/notification.entity';
import { User } from 'users/entity/user.entity';

@Injectable()
export class SocketService {
	@WebSocketServer()
	server: Server;

	constructor(
		@Inject(forwardRef(() => AuthService))
		private readonly authService: AuthService,
		@Inject(forwardRef(() => UsersService))
		private readonly userService: UsersService
	) {}

	private readonly usersSocket: Map<number, string> = new Map<number, string>()

	async getUserFromSocket(socket: Socket) : Promise<User> {
		const token = socket.handshake.auth.token;
		if (!token || token.length === 0) {
			Logger.debug(`Token is null or empty`, 'WebSocket');
			throw new UnauthorizedException('Invalid token.');
		}
		const user = await this.authService.getUserFromAuthenticationToken(token);
		if (!user) {
			throw new UnauthorizedException('Invalid credentials.');
		}
		return user;
	}

	saveClientSocket(user: User, clientSocketId: string) {
		const oldClientSocketId: string = this.usersSocket.get(user.id);
		if (oldClientSocketId) {
			const oldSocket: Socket = this.server.sockets.sockets.get(oldClientSocketId);
			oldSocket.emit('');
			oldSocket.disconnect();
			Logger.debug(`${user.username} socket ${oldClientSocketId} was remplaced.`, 'WebSocket');
		}
		this.usersSocket.set(user.id, clientSocketId)
		return oldClientSocketId;
	}

	deleteClientSocket(userId: number) {
		this.usersSocket.delete(userId);
	}

	getSocketToEmit(targetId: number) : Socket {
		const socketId = this.usersSocket.get(targetId);
		return this.server.sockets.sockets.get(socketId)
	}

	AddNotification(target: User, notification: NotificationFront) {
		const clientSocket = this.getSocketToEmit(target.id)
		if (clientSocket) {
			clientSocket.emit('addNotification', notification);
			if (notification.type == NotificationType.FRIEND_ACCEPT)
				clientSocket.emit('addFriendLeaderboard', notification.from_user.id);
			else if (notification.type == NotificationType.FRIEND_REMOVE)
				clientSocket.emit('removeFriendLeaderboard', notification.from_user.id)
		}
	};

	emitId(userId: number, room: string, ...args: any) {
		const socket: Socket = this.getSocketToEmit(userId);
		if (!socket)
			return;
		socket.emit(room, ...args);
	}

	async emitIds(fromUser: User, userIds: number[], room: string, ...args: any) {
		const users: User[] = await this.userService.findMany(userIds);

		for (let u of users) {
			if (!u.isBlockedUser(fromUser.id))
				this.emitId(u.id, room, ...args);
		}
	}
}
