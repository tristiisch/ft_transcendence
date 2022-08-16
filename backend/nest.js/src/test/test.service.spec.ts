/** @prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { TestFakeService } from './test-fake.service';

describe('TestService', () => {
	let service: TestFakeService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [TestFakeService],
		}).compile();

		service = module.get<TestFakeService>(TestFakeService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
