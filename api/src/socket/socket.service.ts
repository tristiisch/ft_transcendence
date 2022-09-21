import { forwardRef, Inject,Injectable, Logger, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'auth/auth.service';
import { UsersService } from 'users/users.service';
import { Server, Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { WebSocketServer } from '@nestjs/websockets';
import { NotificationFront } from 'notification/entity/notification.entity';
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
		const user = await this.authService.getUserFromAuthenticationToken(token);
		if (!user) {
			throw new UnauthorizedException('Invalid credentials.');
		}
		return user;
	}

	saveClientSocket(user: User, clientSocketId: string) {
		const oldClientSocketId: string = this.usersSocket.get(user.id);
		if (oldClientSocketId)
			Logger.debug(`${user.username} socket ${oldClientSocketId} was remplaced.`, 'WebSocket');
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

	emitId(userId: number, room: string, ...args: any) {
		const socket: Socket = this.getSocketToEmit(userId);
		if (!socket)
			return;
		socket.emit(room, ...args);
	}

	emitIds(userIds: number[], room: string, ...args: any) {
		for (let userId of userIds)
			this.emitId(userId, room, ...args);
	}
}
