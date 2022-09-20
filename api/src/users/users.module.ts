/** @prettier */
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'auth/auth.module';
import { User } from './entity/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SocketModule } from 'socket/socket.module';
import { FriendsModule } from 'friends/friends.module';

@Module({
	imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule), forwardRef(() => SocketModule), FriendsModule],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
