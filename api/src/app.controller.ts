/** @prettier */
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guard';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@UseGuards(JwtAuthGuard)
	@Get()
	getHello(@Req() req): string {
		return req.user;
	}
}
