import { Module } from '@nestjs/common';
import { FriendsModule } from 'src/friends/friends.module';
import { MatchsHistoryModule } from 'src/matchs-history/matchs-history.module';
import { StatsModule } from 'src/stats/stats.module';
import { UsersModule } from 'src/users/users.module';
import { TestController } from './test.controller';
import { TestService } from './test.service';

@Module({
	imports: [UsersModule, StatsModule, MatchsHistoryModule, FriendsModule],
	controllers: [TestController],
	providers: [TestService]
})
export class TestModule {}
