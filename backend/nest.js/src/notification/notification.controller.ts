import { Controller, Get, Param } from '@nestjs/common';
import { isNumberPositive } from 'src/utils/utils';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {

	constructor(private readonly notifService: NotificationService) {}

	@Get(':id')
	getNotification(@Param('id') id: number) {
		isNumberPositive(id, 'get notifications');
		return this.notifService.findMany(id);
	}
}
