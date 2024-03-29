/** @prettier */
import { forwardRef, Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { UsersModule } from 'users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from './entity/friendship.entity';
import { NotificationModule } from 'notification/notification.module';
import { SocketModule } from 'socket/socket.module';

@Module({
	imports: [forwardRef(() => UsersModule), TypeOrmModule.forFeature([Friendship]), NotificationModule, forwardRef(() => SocketModule)],
	providers: [FriendsService],
	controllers: [FriendsController],
	exports: [FriendsService],
})
export class FriendsModule {}
