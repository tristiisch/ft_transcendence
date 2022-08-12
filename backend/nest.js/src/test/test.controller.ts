import { Controller, Get, Inject, Param } from '@nestjs/common';
import { isNumberPositive } from 'src/utils/utils';
import { TestService } from './test.service';

@Controller('test')
export class TestController {

	constructor(private readonly testService: TestService) {}

    @Get('generateFakeUsers/:nb')
	generateFakeUsers(@Param('nb') number: number) {
        isNumberPositive(number, "generate fake users");
		return this.testService.generate(number);
	}
}
