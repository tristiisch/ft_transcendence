import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MatchStats } from './entity/matchstats.entity';
import { MatchOwn } from './entity/own-match.entity';

@Injectable()
export class MatchStatsService {

	constructor(
		@InjectRepository(MatchStats)
		private matchsHistoryRepository: Repository<MatchStats>,
	) {}

	@Inject(UsersService)
	private readonly userService: UsersService;

	public getRepo() {
		return this.matchsHistoryRepository;
	}

	async add(matchHistory: MatchStats) {
		return this.matchsHistoryRepository.save(matchHistory);
	}

	async findAll(userId: number) : Promise<MatchOwn[]> {
		const sqlStatement: SelectQueryBuilder<MatchStats> = this.matchsHistoryRepository.createQueryBuilder('matchhistory')
			.where('matchhistory.user_id1 = :id', { id: userId })
			.orWhere('matchhistory.user_id2 = :id')
			.addOrderBy('matchhistory.id', 'DESC', 'NULLS LAST');
		try {
			return await sqlStatement.getMany().then(async matchs => {
				const matchsFormatted: MatchOwn[] = new Array()
				for (let m of matchs) {
					let matchFormatted: MatchOwn = new MatchOwn();
					let opponentId = m.getOpponent(userId);
					matchFormatted.date = m.timestamp_started;
					matchFormatted.score = m.score;
					matchFormatted.opponent = (await this.userService.findOne(opponentId)).username;
					matchFormatted.won = m.isWinner(userId);
					if (matchFormatted.won ? matchFormatted.score[0] < matchFormatted.score[1] : matchFormatted.score[0] > matchFormatted.score[1]) {
						let tmp = matchFormatted.score[0];
						matchFormatted.score[0] = matchFormatted.score[1];
						matchFormatted.score[1] = tmp;
					}
					matchsFormatted.push(matchFormatted);
				}
				return matchsFormatted;
			});
		} catch (err) {
			this.userService.lambdaDatabaseUnvailable(err);
		}
	}
}
