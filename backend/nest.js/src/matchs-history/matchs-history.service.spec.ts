import { Test, TestingModule } from '@nestjs/testing';
import { MatchsStatsService } from './matchs-history.service';

describe('MatchsstatsService', () => {
	let service: MatchsStatsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [MatchsStatsService],
		}).compile();

		service = module.get<MatchsStatsService>(MatchsStatsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
