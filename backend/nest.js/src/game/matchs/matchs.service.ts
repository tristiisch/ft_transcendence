import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { IsNull, Not, Repository, SelectQueryBuilder } from 'typeorm';
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

	async findOnlineMatchs() : Promise<MatchStats[]> {
		const sqlStatement: SelectQueryBuilder<MatchStats> = this.matchsHistoryRepository.createQueryBuilder('matchhistory')
			.where('matchhistory.timestamp_ended IS NULL')
			.andWhere('matchhistory.score IS NOT NULL')
			.addOrderBy('matchhistory.id', 'DESC', 'NULLS LAST');
		return await sqlStatement.getMany().then((matchsStats: MatchStats[]) => {
			matchsStats.forEach(async (ms: MatchStats) => {
				const user1: User = await this.userService.findOne(ms.user1_id);
				const user2: User = await this.userService.findOne(ms.user2_id);

				ms.user1_avatar = user1.getAvatarURL();
				ms.user1_username = user1.username;

				ms.user2_avatar = user2.getAvatarURL();
				ms.user2_username = user2.username;
			})
			return matchsStats;
		});
	}

	async save(match: MatchStats) {
		return this.matchsHistoryRepository.save(match)
	}
}
