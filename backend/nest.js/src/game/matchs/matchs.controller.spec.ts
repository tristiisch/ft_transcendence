import { Test, TestingModule } from '@nestjs/testing';
import { MatchsStatsController } from './matchs.controller';

describe('MatchsstatsController', () => {
	let controller: MatchsStatsController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [MatchsStatsController],
		}).compile();

		controller = module.get<MatchsStatsController>(MatchsStatsController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
