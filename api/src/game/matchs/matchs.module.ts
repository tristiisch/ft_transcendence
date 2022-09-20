import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'users/users.module';
import { MatchStats } from './entity/matchstats.entity';
import { MatchsStatsController as MatchsStatsController } from './matchs.controller';
import { MatchStatsService as MatchStatsService } from './matchs.service';

@Module({
	imports: [forwardRef(() => UsersModule), TypeOrmModule.forFeature([MatchStats])],
	controllers: [MatchsStatsController],
	providers: [MatchStatsService],
	exports: [MatchStatsService]
})
export class MatchStatsModule {}
