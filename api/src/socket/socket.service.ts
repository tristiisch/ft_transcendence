import { forwardRef, Inject,Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'auth/auth.service';
import { UsersService } from 'users/users.service';
import { Server, Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { WebSocketServer } from '@nestjs/websockets';
import { NotificationFront, NotificationType } from 'notification/entity/notification.entity';
import { User, UserStatus } from 'users/entity/user.entity';

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
			throw new UnauthorizedException('Invalid token.');
		}
		const user = await this.authService.getUserFromAuthenticationToken(token);
		if (!user) {
			throw new UnauthorizedException('Invalid credentials.');
		}
		return user;
	}

	updateStatus(clientSocket: Socket, user: User, status: UserStatus) {
		clientSocket.broadcast.emit('updateUserStatus', ({ id: user.id, status: status }))
		this.userService.getRepo().update(user.id, { status: status });
	}

	async saveClientSocket(user: User, clientSocket: Socket) {
		const oldClientSocketId: string = this.usersSocket.get(user.id);
		if (oldClientSocketId) {
			const oldSocket: Socket = this.server.sockets.sockets.get(oldClientSocketId);
			oldSocket.emit('double_connection', () => {
				oldSocket.disconnect();
				this.updateStatus(clientSocket, user, UserStatus.ONLINE);
			});
		}
		this.usersSocket.set(user.id, clientSocket.id)
		return oldClientSocketId;
	}

	deleteClientSocket(userId: number, clientSocket: Socket) {
		if (this.usersSocket.get(userId) === clientSocket.id)
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

	async emitIds(fromUser: User | null, userIds: number[], room: string, ...args: any) {
		const users: User[] = await this.userService.findMany(userIds);

		for (let u of users) {
			if (!fromUser || !u.isBlockedUser(fromUser.id))
				this.emitId(u.id, room, ...args);
		}
	}
}
