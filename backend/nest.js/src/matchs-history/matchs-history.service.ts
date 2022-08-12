import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MatchHistory } from './entity/matchstats.entity';
import { MatchOwn } from './entity/own-match.entity';

@Injectable()
export class MatchsHistoryService {

	constructor(
		@InjectRepository(MatchHistory)
		private matchsHistoryRepository: Repository<MatchHistory>,
	) {}

	@Inject(UsersService)
	private readonly userService: UsersService;

	public getRepo() {
		return this.matchsHistoryRepository;
	}

	async add(matchHistory: MatchHistory) {
		return this.matchsHistoryRepository.save(matchHistory);
	}

	async findAll(userId: number) : Promise<MatchOwn[]> {
		const sqlStatement: SelectQueryBuilder<MatchHistory> = this.matchsHistoryRepository.createQueryBuilder("matchHistory")
			.where("matchHistory.winner_id = :id", { id: userId })
			.orWhere("matchHistory.loser_id = :id")
			.addOrderBy('matchHistory.id', 'DESC', 'NULLS LAST');

		try {
			return await sqlStatement.getMany().then(matchs => {
				const matchsFormatted: MatchOwn[] = new Array()

				matchs.forEach(async m => {
					let matchFormatted: MatchOwn = new MatchOwn();
					let opponentId = m.getOpponent(userId);
					matchFormatted.date = m.timestamp_started;
					matchFormatted.score = m.score;
					matchFormatted.opponent = (await this.userService.findOne(opponentId)).username;
					matchFormatted.won = m.isWinner(userId);
					matchsFormatted.push(matchFormatted);
				});
				return matchsFormatted;
			});
		} catch (err) {
			this.userService.lambdaDatabaseUnvailable(err);
		}
	}
}
