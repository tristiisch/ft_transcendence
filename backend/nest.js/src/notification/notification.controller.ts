import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard';
import { isNumberPositive } from 'src/utils/utils';
import { NotificationAction } from './entity/notification-action.entity';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {

	constructor(private readonly notifService: NotificationService) {}

	@UseGuards(JwtAuthGuard)
	@Get(':id')
	getNotification(@Param('id') id: number) {
		isNumberPositive(id, 'get notifications');
		return this.notifService.findMany(id);
	}

	@UseGuards(JwtAuthGuard)
	@Post('action')
	notificationAction(@Req() req, @Body() notifAction: NotificationAction) {
		return this.notifService.action(req.user, notifAction);
	}
}
