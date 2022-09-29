import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from 'chat/chat.module';
import { ChatService } from 'chat/chat.service';
import { StatsModule } from 'game/stats/stats.module';
import { NotificationModule } from 'notification/notification.module';
import { NotificationService } from 'notification/notification.service';
import { SocketModule } from 'socket/socket.module';
import { UsersModule } from 'users/users.module';
import { Match, MatchLiveInfos } from './entity/match.entity';
import { MatchsController as MatchsController } from './matchs.controller';
import { MatchService as MatchService } from './matchs.service';

@Module({
	imports: [forwardRef(() => UsersModule), TypeOrmModule.forFeature([Match]), forwardRef(() => StatsModule), forwardRef(() => NotificationModule), forwardRef(() => SocketModule), forwardRef(() => ChatModule)],
	controllers: [MatchsController],
	providers: [MatchService],
	exports: [MatchService]
})
export class MatchStatsModule {}
