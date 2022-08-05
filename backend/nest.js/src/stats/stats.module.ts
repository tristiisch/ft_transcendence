import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { UserStats } from './entity/userstats.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
	imports: [UsersModule, TypeOrmModule.forFeature([UserStats])],
	providers: [StatsService],
	controllers: [StatsController]
})
export class StatsModule {}
