/** @prettier */
import { Body, Controller, Get, Inject, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserSelectDTO } from '../users/entity/user-select.dto';
import { User } from '../users/entity/user.entity';
import { UsersService } from '../users/users.service';
import { isNumberPositive } from '../utils/utils';
import { TestDbService } from './test-db.service';
import { TestFakeService } from './test-fake.service';

@Controller('test')
export class TestController {
	constructor(private readonly fakeService: TestFakeService, private readonly dbService: TestDbService) {}

	@Inject(UsersService)
	private readonly usersService: UsersService;

	@Get('addFakeData/:username')
	async addFakeData(@Param('username') username: string) {
		const target: User = await this.usersService.findOneByUsername(username);
		return this.fakeService.addFakeData(target);
	}

	@Get('generateFakeUsers/:nb')
	generateFakeUsers(@Param('nb') number: number) {
		isNumberPositive(number, 'generate fake users');
		return this.fakeService.generate(number);
	}

	@Get('cleardb')
	clearAllTables() {
		this.dbService.clearAllTables();
		return { statusCode: 200, message: 'All tables has been cleared.' };
	}
}
