import { Module } from '@nestjs/common';
import { MatchsHistoryController as MatchsHistoryController } from './matchs-history.controller';
import { MatchsStatsService as MatchsHistoryService } from './matchs-history.service';

@Module({
	controllers: [MatchsHistoryController],
	providers: [MatchsHistoryService]
})
export class MatchsHistoryModule {}
