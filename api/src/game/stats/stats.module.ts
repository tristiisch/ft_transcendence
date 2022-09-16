import { forwardRef, Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { UserStats } from './entity/userstats.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../../users/users.module';
import { FriendsModule } from '../../friends/friends.module';

@Module({
	imports: [forwardRef(() => UsersModule), TypeOrmModule.forFeature([UserStats]), forwardRef(() => FriendsModule)],
	providers: [StatsService],
	controllers: [StatsController],
	exports: [StatsService]
})
export class StatsModule {}
