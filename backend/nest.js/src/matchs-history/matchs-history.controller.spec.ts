import { Test, TestingModule } from '@nestjs/testing';
import { MatchsHistoryController } from './matchs-history.controller';

describe('MatchsstatsController', () => {
	let controller: MatchsHistoryController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [MatchsHistoryController],
		}).compile();

		controller = module.get<MatchsHistoryController>(MatchsHistoryController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
