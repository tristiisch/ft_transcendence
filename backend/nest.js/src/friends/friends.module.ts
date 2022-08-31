/** @prettier */
import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from './entity/friendship.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
	imports: [UsersModule, TypeOrmModule.forFeature([Friendship]), NotificationModule],
	providers: [FriendsService],
	controllers: [FriendsController],
	exports: [FriendsService],
})
export class FriendsModule {}
