import { forwardRef, Module } from '@nestjs/common';
import { ChatModule } from 'chat/chat.module';
import { AuthModule } from 'auth/auth.module';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { JwtStrategySocket } from './strategy/jwt-socket.strategy';
import { UsersModule } from 'users/users.module';
import { MatchStatsModule } from 'game/matchs/matchs.module';
import { NotificationService } from 'notification/notification.service';
import { NotificationModule } from 'notification/notification.module';

@Module({
	imports: [forwardRef(() => AuthModule), forwardRef(() => ChatModule), forwardRef(() => UsersModule), forwardRef(() => MatchStatsModule), forwardRef(() => NotificationModule)],
	providers: [SocketGateway, SocketService, JwtStrategySocket],
	exports: [SocketService],
})

export class SocketModule {}
