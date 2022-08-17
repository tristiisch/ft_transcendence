/** @prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database/database.service';
import { ChatModule } from './chat/chat.module';
import { FriendsModule } from './friends/friends.module';
import { StatsModule } from './game/stats/stats.module';
import { AuthModule } from './auth/auth.module';
import { TestModule } from './test/test.module';
import { NotificationModule } from './notification/notification.module';
import { MatchStatsModule } from './game/matchs/matchs.module';

@Module({
	imports: [
		UsersModule,
		DatabaseModule,
		TypeOrmModule.forRootAsync({ useClass: DatabaseService }),
		ChatModule,
		FriendsModule,
		StatsModule,
		AuthModule,
		MatchStatsModule,
		TestModule,
		NotificationModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
