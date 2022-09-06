/** @prettier */
import { Controller, Get, Inject, Param, } from '@nestjs/common';
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

	@Get('generateChannels/:username')
	async createChannels(@Param('username') username: string) {
		const target: User = await this.usersService.findOneByUsername(username);
		return this.fakeService.addChats(target);
	}
}
