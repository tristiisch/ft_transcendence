import { Inject, Injectable, InternalServerErrorException, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { isEquals, isNumberPositive } from 'src/utils/utils';
import { InsertResult, Repository, SelectQueryBuilder } from 'typeorm';
import { UserStats } from './entity/userstats.entity';

@Injectable()
export class StatsService {

	constructor(
		@InjectRepository(UserStats)
		private statsRepository: Repository<UserStats>,
	) {}

    @Inject(UsersService)
    private readonly userService: UsersService;

    async findOne(userId: number): Promise<UserStats> {
		isNumberPositive(userId, 'get a user');
        await this.userService.findOne(userId);
		return await this.statsRepository.findOneBy({ user_id: userId }).then((stats: UserStats) => {
            return stats;
        }, this.userService.lambdaDatabaseUnvailable);
    }

	/**
	 * @deprecated Only for test
	 */
    async add(stats: UserStats) {
		return await this.statsRepository.insert(stats).then((insertResult: InsertResult) => {
			if (insertResult.identifiers.length < 1) {
				throw new InternalServerErrorException(`Can't add stats of user ${stats.user_id}.`);
			} else if (insertResult.identifiers.length > 1) {
				throw new InternalServerErrorException(`${insertResult.identifiers.length} rows was modify instead of one.`);
			}
			return stats;
		}, this.userService.lambdaDatabaseUnvailable);
    }

	/**
	 * @deprecated Only for test
	 */
    async update(stats: UserStats) {
        await this.userService.findOne(stats.user_id);
		const statsBefore: UserStats = await this.findOne(stats.user_id);
		await this.statsRepository.update(stats.user_id, stats);
		const statsAfter: UserStats = await this.findOne(stats.user_id);

		if (isEquals(statsBefore, statsAfter)) {
			return { statusCode: 200, message: 'Nothing change.'}
		}
		return statsAfter;
    }

    async leaderboard(min: number, max: number): Promise<UserStats[]> {
		if (min < 0)
			throw new PreconditionFailedException(`Can't get leaderboard with negative min ${max}.`);
		if (max <= 0)
			throw new PreconditionFailedException(`Can't get leaderboard with negative max ${max}.`);
		const sqlStatement: SelectQueryBuilder<UserStats> = this.statsRepository.createQueryBuilder('userstats');

		sqlStatement.skip(min).limit(max).addOrderBy('userstats.score', 'DESC', 'NULLS LAST');
		// console.log("SQL UserStats leaderboard", sqlStatement.getQueryAndParameters());
	
		return await sqlStatement.getMany().then((userStats: UserStats[]) => {
			return userStats;
		}, this.userService.lambdaDatabaseUnvailable);
    }
}
