import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { User } from 'users/entity/user.entity';
import { isNumberPositive } from 'utils/utils';
import { JwtAuthGuard } from '../auth/guard';
import { NotificationAction } from './entity/notification-action.entity';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {

	constructor(private readonly notifService: NotificationService) {}

	@UseGuards(JwtAuthGuard)
	@Get()
	getNotification(@Req() req) {
		return this.notifService.findMany(req.user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Post('action')
	async notificationAction(@Req() req, @Body() notifAction: NotificationAction) {
		return await this.notifService.action(req.user, notifAction);
	}

	@UseGuards(JwtAuthGuard)
	@Get('remove')
	async deleteTempNotif(@Req() req) {
		const user: User = req.user;
		await this.notifService.deleteTempNotifs(user);
	}
}
