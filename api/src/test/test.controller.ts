/** @prettier */
import { Controller, Get, Inject, Param, PreconditionFailedException, } from '@nestjs/common';
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

	@Get('clear-chat')
	clearChat() {
		this.dbService.clearChat();
		return { statusCode: 200, message: 'All chat has been cleared.' };
	}

	@Get('generateChannels/:username')
	async createChannels(@Param('username') username: string) {
		const target: User = await this.usersService.findOneByUsername(username);
		return this.fakeService.addChats(target, 1);
	}

	@Get('generateChannels/:username/:nb')
	async createManyChannels(@Param('username') username: string, @Param('nb') nb: number) {
		const target: User = await this.usersService.findOneByUsername(username);
		return this.fakeService.addChats(target, nb);
	}

	@Get('dev')
	async devMode() {
		const userNeeded: number = 5;
		const channelCreated: number = 5;
		const allUsers = await this.usersService.findAll();

		await this.fakeService.generate(userNeeded);

		const target: User = await this.usersService.findOneWith42Login();
		if (!target) {
			throw new PreconditionFailedException("Can't find a user registered in database.");
		}
		const ret = await this.fakeService.addChats(target, channelCreated);
		ret.message += ` ${userNeeded} fake user created. Based on ${target.username} http://localhost:8001/profile/${target.id}`
		return ret;
	}
}
