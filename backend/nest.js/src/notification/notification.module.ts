/** @prettier */
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { NotificationService } from './notification.service';
import { Notification } from './entity/notification.entity';
import { NotificationController } from './notification.controller';
import { FriendsModule } from 'src/friends/friends.module';

@Module({
	imports: [UsersModule, TypeOrmModule.forFeature([Notification]), forwardRef(() => FriendsModule)],
	providers: [NotificationService],
	exports: [NotificationService],
	controllers: [NotificationController],
})
export class NotificationModule {}
