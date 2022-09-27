/** @prettier */
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'auth/auth.module';
import { User } from './entity/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SocketModule } from 'socket/socket.module';
import { FriendsModule } from 'friends/friends.module';
import { NotificationModule } from 'notification/notification.module';

@Module({
	imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule), forwardRef(() => SocketModule), FriendsModule, forwardRef(() => NotificationModule)],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
