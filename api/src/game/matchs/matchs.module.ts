import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'users/users.module';
import { Match, MatchStats, MatchLiveInfos } from './entity/match.entity';
import { MatchsStatsController as MatchsStatsController } from './matchs.controller';
import { MatchStatsService as MatchStatsService } from './matchs.service';
// import MatchLiveInfos from './entity/matchliveinfos.entity';

@Module({
	imports: [forwardRef(() => UsersModule), TypeOrmModule.forFeature([MatchStats])],
	controllers: [MatchsStatsController],
	providers: [MatchStatsService],
	exports: [MatchStatsService]
})
export class MatchStatsModule {}
