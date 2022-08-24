/** @prettier */
import { Module } from '@nestjs/common';
import { FriendsModule } from 'src/friends/friends.module';
import { StatsModule } from 'src/game/stats/stats.module';
import { UsersModule } from 'src/users/users.module';
import { TestController } from './test.controller';
import { TestFakeService } from './test-fake.service';
import { TestDbService } from './test-db.service';
import { MatchStatsModule } from 'src/game/matchs/matchs.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [UsersModule, StatsModule, MatchStatsModule, FriendsModule, AuthModule],
	controllers: [TestController],
	providers: [TestFakeService, TestDbService],
})
export class TestModule {}
