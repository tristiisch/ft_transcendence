/** @prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { NotificationService } from './notification.service';
import { Notification } from './entity/notification.entity';

@Module({
	imports: [UsersModule, TypeOrmModule.forFeature([Notification])],
	providers: [NotificationService],
	exports: [NotificationService],
})
export class NotificationModule {}
