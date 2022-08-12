import { Controller, Get, Inject, Param } from '@nestjs/common';
import { isNumberPositive } from 'src/utils/utils';
import { TestDbService } from './test-db.service';
import { TestFakeService } from './test-fake.service';

@Controller('test')
export class TestController {

	constructor(private readonly fakeService: TestFakeService, private readonly dbService: TestDbService) {}

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
