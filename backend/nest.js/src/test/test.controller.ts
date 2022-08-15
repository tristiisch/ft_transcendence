import { Body, Controller, Get, Inject, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserSelectDTO } from 'src/users/entity/user-select.dto';
import { User } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { isNumberPositive } from 'src/utils/utils';
import { TestDbService } from './test-db.service';
import { TestFakeService } from './test-fake.service';

@Controller('test')
export class TestController {

	constructor(private readonly fakeService: TestFakeService, private readonly dbService: TestDbService) {}

	@Inject(UsersService)
	private readonly usersService: UsersService;

	@Post('addFakeData')
	async addFakeData(@Body() user: UserSelectDTO) {
		const target: User = await user.resolveUser(this.usersService);
		return this.fakeService.addFakeData(target);
	}

	@Get('generateFakeUsers/:nb')
	generateFakeUsers(@Param('nb') number: number) {
		isNumberPositive(number, "generate fake users");
		return this.fakeService.generate(number);
	}

	@Get('cleardb')
	clearAllTables() {
		this.dbService.clearAllTables();
		return { statusCode: 200, message: "All tables has been cleared."}
	}
}
