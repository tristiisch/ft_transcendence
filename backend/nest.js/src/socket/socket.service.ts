import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class SocketService {
	constructor(
		private readonly authService: AuthService,
	) {}

async getUserFromSocket(socket: Socket) {
	const token = socket.handshake.auth.token;
	const user = await this.authService.getUserFromAuthenticationToken(token);
	if (!user) {
		console.log('Invalid credentials.')
		//throw new WsException('Invalid credentials.');
	}
	return user;
	}
}
