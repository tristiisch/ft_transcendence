/** @prettier */
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { NotificationService } from './notification.service';
import { Notification } from './entity/notification.entity';
import { NotificationController } from './notification.controller';
import { FriendsModule } from '../friends/friends.module';

@Module({
	imports: [UsersModule, TypeOrmModule.forFeature([Notification]), forwardRef(() => FriendsModule)],
	providers: [NotificationService],
	controllers: [NotificationController],
	exports: [NotificationService],
})
export class NotificationModule {}
