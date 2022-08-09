import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { MatchHistory } from './entity/matchstats.entity';
import { MatchsHistoryController as MatchsHistoryController } from './matchs-history.controller';
import { MatchsHistoryService as MatchsHistoryService } from './matchs-history.service';

@Module({
	imports: [UsersModule, TypeOrmModule.forFeature([MatchHistory])],
	controllers: [MatchsHistoryController],
	providers: [MatchsHistoryService]
})
export class MatchsHistoryModule {}
