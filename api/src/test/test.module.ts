/** @prettier */
import { Module } from '@nestjs/common';
import { FriendsModule } from 'friends/friends.module';
import { StatsModule } from 'game/stats/stats.module';
import { UsersModule } from 'users/users.module';
import { TestController } from './test.controller';
import { TestFakeService } from './test-fake.service';
import { TestDbService } from './test-db.service';
import { MatchStatsModule } from 'game/matchs/matchs.module';
import { AuthModule } from 'auth/auth.module';
import { ChatModule } from 'chat/chat.module';

@Module({
	imports: [UsersModule, StatsModule, MatchStatsModule, FriendsModule, AuthModule, ChatModule],
	controllers: [TestController],
	providers: [TestFakeService, TestDbService],
})
export class TestModule {}
