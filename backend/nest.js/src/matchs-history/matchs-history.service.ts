import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MatchHistory } from './entity/matchstats.entity';

@Injectable()
export class MatchsHistoryService {

	constructor(
		@InjectRepository(MatchHistory)
		private matchsHistoryRepository: Repository<MatchHistory>,
	) {}

	@Inject(UsersService)
	private readonly userService: UsersService;

	async add(matchHistory: MatchHistory) {
		this.matchsHistoryRepository.save(matchHistory);
	}

	async findAll(userId: number) : Promise<MatchHistory[]> {
		const sqlStatement: SelectQueryBuilder<MatchHistory> = this.matchsHistoryRepository.createQueryBuilder("matchHistory")
			.where("matchHistory.winner_id = :id", { id: userId })
			.orWhere("matchHistory.loser_id = :id");

		try {
			return await sqlStatement.getMany();
		} catch (err) {
			this.userService.lambdaDatabaseUnvailable(err);
		}
	}
}
