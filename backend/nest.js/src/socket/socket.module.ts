import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { AuthModule } from '../auth/auth.module';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';

@Module({
	imports: [AuthModule, ChatModule],
	providers: [SocketGateway, SocketService],
	exports: [SocketService],
	})

export class SocketModule {}
