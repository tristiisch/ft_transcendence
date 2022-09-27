import { forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendsService } from 'friends/friends.service';
import { User } from 'users/entity/user.entity';
import { UsersService } from 'users/users.service';
import { isEquals, isNumberPositive } from 'utils/utils';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { LeaderboardUser } from './entity/leaderboard.entity';
import { UserStats } from './entity/userstats.entity';

@Injectable()
export class StatsService {

	constructor(
		@InjectRepository(UserStats)
		private statsRepository: Repository<UserStats>,
	) {}

	public getRepo() {
		return this.statsRepository;
	}

    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService;
    @Inject(forwardRef(() => FriendsService))
    private readonly friendsService: FriendsService;

	/**
	 * @param userId UNSAFE: this function didn't check if user id exist or not
	 */
    async findOneById(userId: number): Promise<UserStats> {
		isNumberPositive(userId, 'get a user');
		return await this.statsRepository.findOneBy({ user_id: userId }).then((stats: UserStats) => {
            return stats;
        }, this.userService.lambdaDatabaseUnvailable);
    }

    async findOne(user: User): Promise<UserStats> {
		return await this.statsRepository.findOneBy({ user_id: user.id }).then((stats: UserStats) => {
            return stats;
        }, this.userService.lambdaDatabaseUnvailable);
    }

    async findOrCreate(userId: number): Promise<UserStats> {
		let userStats: UserStats = await this.findOneById(userId);
		if (!userStats)
			userStats = new UserStats(userId);
		return userStats;
    }

    async addDefeat(userId: number) {
		await this.statsRepository.createQueryBuilder()
			.update(UserStats).where({ user_id: userId })
			.set({ defeats: () => "defeats + 1" })
			.execute()
    }

    async addVictory(userId: number) {
		await this.statsRepository.createQueryBuilder()
			.update(UserStats).where({ user_id: userId })
			.set({ victories: () => "victories + 1" })
			.execute()
    }

    async add(stats: UserStats) {
		return await this.statsRepository.insert(stats);
    }

	/**
	 * @deprecated Only for test
	 */
    async update(stats: UserStats) {
        await this.userService.findOne(stats.user_id);
		const statsBefore: UserStats = await this.findOneById(stats.user_id);
		await this.statsRepository.update(stats.user_id, stats);
		const statsAfter: UserStats = await this.findOneById(stats.user_id);

		if (isEquals(statsBefore, statsAfter)) {
			return { statusCode: 200, message: 'Nothing change.'}
		}
		return statsAfter;
    }

    async leaderboardPage(min: number, max: number): Promise<UserStats[]> {
		if (min < 0)
			throw new PreconditionFailedException(`Can't get leaderboard with negative min ${min}.`);
		if (max <= 0)
			throw new PreconditionFailedException(`Can't get leaderboard with negative max ${max}.`);
		const sqlStatement: SelectQueryBuilder<UserStats> = this.statsRepository.createQueryBuilder('userstats');

		sqlStatement.skip(min).limit(max).orderBy('userstats.score', 'DESC', 'NULLS LAST');

		return await sqlStatement.getMany().then((userStats: UserStats[]) => {
			return userStats;
		}, this.userService.lambdaDatabaseUnvailable);
    }

    async leaderboard(): Promise<UserStats[]> {
		const sqlStatement: SelectQueryBuilder<UserStats> = this.statsRepository.createQueryBuilder('userstats');

		sqlStatement.orderBy('userstats.score', 'DESC', 'NULLS LAST');
			// Need to order by date update
			// .addOrderBy('userstats.victories', 'ASC', 'NULLS LAST')
			// .addOrderBy('userstats.defeats', 'DESC', 'NULLS LAST');

		return await sqlStatement.getMany().then((userStats: UserStats[]) => {
			return userStats;
		}, this.userService.lambdaDatabaseUnvailable);
    }

    async leaderboardWithFriends(user: User): Promise<{ leaderBoard: LeaderboardUser[], leaderBoardFriends: LeaderboardUser[] }> {
		const friendsIds: number[] = await this.friendsService.findFriendsIds(user.id);
		const userStats: UserStats[] = await this.leaderboard();
		const leaderBoard: LeaderboardUser[] = new Array();
		const leaderBoardFriends: LeaderboardUser[] = new Array();

		let index: number = 1;
		for (let us of userStats) {
			const leaderUser: LeaderboardUser = new LeaderboardUser();
			const target: User = await this.userService.findOne(us.user_id);

			leaderUser.rank = index++;
			leaderUser.username = target.username;
			leaderUser.id = target.id;
			leaderUser.avatar = target.getAvatarURL();
			leaderUser.status = target.status;

			if (us.user_id === user.id || friendsIds.length !== 0 && friendsIds.indexOf(us.user_id) !== -1)
				leaderBoardFriends.push(leaderUser);

			leaderBoard.push(leaderUser);
		}
		return {leaderBoard, leaderBoardFriends};
    }

	async getRank(user: User): Promise<number> {
		const rank = await this.statsRepository.query(`SELECT position FROM (SELECT *, row_number() over (order by score DESC) ` +
			`as position from public.user_stats) result where user_id = ${user.id};`);
		if (rank == null || rank.length != 1)
			return -1;
		return parseInt(rank[0].position);
	}
}
