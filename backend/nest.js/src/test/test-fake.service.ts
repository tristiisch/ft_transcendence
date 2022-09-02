/** @prettier */
import { Inject, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { FriendsService } from '../friends/friends.service';
import { MatchStats } from '../game/matchs/entity/matchstats.entity';
import { MatchStatsService } from '../game/matchs/matchs.service';
import { UserStats } from '../game/stats/entity/userstats.entity';
import { StatsService } from '../game/stats/stats.service';
import { UserSelectDTO } from '../users/entity/user-select.dto';
import { User, UserStatus } from '../users/entity/user.entity';
import { UsersService } from '../users/users.service';
import { random, randomElement, randomEnum, removeFromArray, removesFromArray, toBase64 } from '../utils/utils';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';

@Injectable()
export class TestFakeService {
	@Inject(UsersService)
	private readonly usersService: UsersService;
	@Inject(FriendsService)
	private readonly friendsService: FriendsService;
	@Inject(StatsService)
	private readonly statsService: StatsService;
	@Inject(MatchStatsService)
	private readonly matchHistoryService: MatchStatsService;
	@Inject(AuthService)
	private readonly authService: AuthService;

	private readonly randomMaxStats = 100;
	private readonly randomMaxScoreGame = 5;

	async generate(nbUsers: number) {
		const data = new Array();
		const allUserIds: number[] = await this.getUsersIds();
		for (let i: number = 1; i <= nbUsers; ++i) {
			let fakeUser: { user: User; matchs: MatchStats } = await this.createFakeUser(allUserIds);
			data.push(fakeUser);
			allUserIds.push(fakeUser.user.id);
		}
		return data;
	}

	async createFakeUser(allUserIds: number[]): Promise<{ user: User; matchs: MatchStats }> {
		const user: User = await this.initUser();
		const allUserIdsExceptUser: number[] = removeFromArray(allUserIds, user.id);

		// const stats: UserStats = await this.initStats(user);
		const matchs: MatchStats = await this.initMatchHistory(user, allUserIdsExceptUser);
		const usersWithoutRelation: number[] = removesFromArray(allUserIdsExceptUser, await this.friendsService.findAllRelationsId(user.id));

		this.initNewFriendship(user, usersWithoutRelation);
		return { user, matchs };
	}

	async addFakeData(user: User): Promise<{ statusCode: number; message: string }> {
		const allUserIdsExceptUser: number[] = removeFromArray(await this.getUsersIds(), user.id);

		// const stats: UserStats = await this.initStats(user);
		let iMatchs = -1;
		while (++iMatchs < allUserIdsExceptUser.length) {
			const matchs: MatchStats = await this.initMatchHistory(user, allUserIdsExceptUser);
			if (matchs == null) break;
		}
		const userWithRelationsIds: number[] = await this.friendsService.findAllRelationsId(user.id);
		let usersWithoutRelation: number[] = removesFromArray(allUserIdsExceptUser, userWithRelationsIds);

		// console.log('debug usersWithoutRelation', usersWithoutRelation);
		for (const u of userWithRelationsIds) {

			if (usersWithoutRelation.indexOf(u) != -1) {
				throw new NotAcceptableException(`You want to add a relationship between ${user.username} & ${u}, but they already have a relationship.`);
			}
		}

		let iFriends = -1;
		while (++iFriends < usersWithoutRelation.length) {
			const target: UserSelectDTO = await this.initNewFriendship(user, usersWithoutRelation);
			if (!target) break;
			removeFromArray(usersWithoutRelation, target.id);
		}
		return { statusCode: 200, message: `${iMatchs} matches and ${iFriends} friend relationships are added.` };
	}

	async initUser(): Promise<User> {
		let user: User = new User();
		user.username = Math.random().toString(36).substring(2, 9);
		user.login_42 = Math.random().toString(36).substring(2, 9);
		user.avatar_64 = await toBase64('https://picsum.photos/200');
		user.status = randomEnum(UserStatus);
		return await this.usersService.add(user);
	}

	// async initStats(user: User): Promise<UserStats> {
	// 	const userStats: UserStats = new UserStats(user.id);

	// 	userStats.victories = random(0, this.randomMaxStats);
	// 	userStats.defeats = random(0, this.randomMaxStats);

	// 	return this.statsService.add(userStats);
	// }

	async initMatchHistory(user: User, userIds: number[]): Promise<MatchStats> {
		if (userIds.length === 0) {
			console.log(`Can't find a valid userId for matchHistory of ${JSON.stringify(user)}.`);
			return null;
		}
		const targetId: number = randomElement(userIds);
		const matchHistory: MatchStats = new MatchStats();

		if (random(0, 2) === 1) {
			matchHistory.user2_id = user.id;
			matchHistory.user1_id = targetId;
		} else {
			matchHistory.user1_id = user.id;
			matchHistory.user2_id = targetId;
		}

		if (random(0, 4) >= 1) {
			const scoreWinner: number = this.randomMaxScoreGame;
			const scoreLoser: number = random(0, this.randomMaxScoreGame);
			if (random(0, 2) === 1) {
				matchHistory.score = [scoreWinner, scoreLoser];
			} else {
				matchHistory.score = [scoreLoser, scoreWinner];
			}
			matchHistory.timestamp_ended = new Date();
			matchHistory.timestamp_ended.setMinutes(matchHistory.timestamp_ended.getMinutes() + random(5, 60));

			if (matchHistory.getWinner() === user.id) {
				await this.statsService.addVictory(user.id)
				await this.statsService.addDefeat(targetId)
			} else if (matchHistory.getWinner() === targetId) {
				await this.statsService.addVictory(targetId)
				await this.statsService.addDefeat(user.id)
			} else {
				throw new NotAcceptableException(`They is no winner in the match ${JSON.stringify(matchHistory)}.`);
			}
		} else {
			const scoreUser1: number = random(0, this.randomMaxScoreGame);;
			const scoreUser2: number = random(0, this.randomMaxScoreGame);
			matchHistory.score = [scoreUser1, scoreUser2];
		}
		return this.matchHistoryService.add(matchHistory);
	}

	async initNewFriendship(user: User, userIds: number[]): Promise<UserSelectDTO> {
		if (userIds.length === 0) {
			console.log(`Can't find a valid userId for Friendship of ${JSON.stringify(user)}.`);
			return null;
		}
		const randomUser: UserSelectDTO = new UserSelectDTO();
		randomUser.id = randomElement(userIds);
		randomUser.username = randomUser.id.toString();

		await this.friendsService.addFriendRequest(user, randomUser);

		const randomNb: number = random(1, 4);

		if (randomNb == 2) await this.friendsService.removeFriendship(randomUser, user);
		else if (randomNb >= 3) await this.friendsService.acceptFriendRequest(randomUser, user);
		return randomUser;
	}

	private async getUsersIds(): Promise<number[]> {
		const sqlStatement: SelectQueryBuilder<User> = this.usersService.getRepo().createQueryBuilder('user').select(['user.id']);

		return await sqlStatement.getMany().then((users: User[]) => {
			return users.map((u) => u.id);
		}, this.usersService.lambdaDatabaseUnvailable);
	}
}
