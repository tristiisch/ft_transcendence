import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FriendsService } from 'src/friends/friends.service';
import { MatchStats } from 'src/game/matchs/entity/matchstats.entity';
import { MatchStatsService } from 'src/game/matchs/matchs.service';
import { UserStats } from 'src/game/stats/entity/userstats.entity';
import { StatsService } from 'src/game/stats/stats.service';
import { UserSelectDTO } from 'src/users/entity/user-select.dto';
import { User, UserStatus } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { random, randomElement, randomEnum, removeFromArray } from 'src/utils/utils';
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

	private readonly randomMaxStats = 100;
	private readonly randomMaxScoreGame = 5;

	async generate(nbUsers: number) {
		const data = new Array();
		const allUserIds: number[] = await this.getUsersIds();
		for (let i: number = 1; i <= nbUsers; ++i) {
			let fakeUser: {user: User, stats: UserStats, matchs: MatchStats} = await this.createFakeUser(allUserIds)
			data.push(fakeUser);
			allUserIds.push(fakeUser.user.id);
		}
		return data;
	}

	async createFakeUser(allUserIds: number[]) : Promise<{ user: User, stats: UserStats, matchs: MatchStats}> {
		const user: User = await this.initUser();
		const allUserIdsExceptUser: number[] = removeFromArray(allUserIds, user.id);

		const stats: UserStats = await this.initStats(user);
		const matchs: MatchStats = await this.initMatchHistory(user, allUserIdsExceptUser);
	
		this.initNewFriendship(user, allUserIdsExceptUser);
		return ({ user, stats, matchs });
	}

	async addFakeData(user: User): Promise<{ statusCode: number, message: string}> {
		const allUserIdsExceptUser: number[] = removeFromArray(await this.getUsersIds(), user.id);

		const stats: UserStats = await this.initStats(user);
		let iMatchs = -1;
		while (++iMatchs < allUserIdsExceptUser.length) {
			const matchs: MatchStats = await this.initMatchHistory(user, allUserIdsExceptUser);
			if (matchs == null)
				break;
		}
		const allFriendsOfUser: number[] = await this.friendsService.findFriendsIds(user.id);
		for (let userToRemove of allFriendsOfUser) {
			removeFromArray(allUserIdsExceptUser, userToRemove)
		}
		let iFriends = -1;
		while (++iFriends < allUserIdsExceptUser.length) {
			const target: UserSelectDTO = await this.initNewFriendship(user, allFriendsOfUser);
			if (!target)
				break;
			removeFromArray(allUserIdsExceptUser, target.id);
		}
		return ({ statusCode: 200, message: `${iMatchs} matches and ${iFriends} friend relationships are added.` });
	}

	async initUser(): Promise<User> {
		let user: User = new User;
		user.username = Math.random().toString(36).substring(2, 9);
		user.login_42 = Math.random().toString(36).substring(2, 9);
		/*
		user.avatar = await fetch('https://picsum.photos/200').then(function(response) {
			return response.url;
		});
		*/
		user.avatar = "https://i.picsum.photos/id/54/200/200.jpg?hmac=-2_HX5umbAEVPP9CokmPW3Kc8V9iDplneKlS73LWdQQ";
		user.status = randomEnum(UserStatus);
		// user.status = UserStatus.IN_GAME;
		return await this.usersService.add(user);
	}

	async initStats(user: User): Promise<UserStats> {
		let userStats: UserStats = new UserStats();

		userStats.user_id = user.id;
		userStats.victories = random(0, this.randomMaxStats);
		userStats.defeats = random(0, this.randomMaxStats);

		return this.statsService.add(userStats);
	}

	async initMatchHistory(user: User, userIds: number[]): Promise<MatchStats> {
		if (userIds.length === 0) {
			console.log(`Can't find a valid userId for matchHistory of ${JSON.stringify(user)}.`);
			return null;
		}
		const matchHistory: MatchStats = new MatchStats();
		
		if (random(0, 2) === 1) {
			matchHistory.user_id2 = user.id;
			matchHistory.user_id1 = randomElement(userIds);
		} else {
			matchHistory.user_id1 = user.id;
			matchHistory.user_id2 = randomElement(userIds);
		}

		const scoreWinner: number = this.randomMaxScoreGame;
		const scoreLoser: number = random(0, this.randomMaxScoreGame);
		if (random(0, 2) === 1)
			matchHistory.score = [scoreWinner, scoreLoser];
		else
			matchHistory.score = [scoreLoser, scoreWinner];
		return this.matchHistoryService.add(matchHistory);
	}

	async initNewFriendship(user: User, userIds: number[]): Promise<UserSelectDTO> {
		if (userIds.length === 0) {
			console.log(`Can't find a valid userId for Friendship of ${JSON.stringify(user)}.`);
			return null;
		}
		const randomUserId: number = randomElement(userIds);
		const randomUser: UserSelectDTO = new UserSelectDTO();
		randomUser.id = randomUserId;
		randomUser.username = "fakePlayer";
		const randomNb: number = random(1, 4);

		console.log('User', user, 'randomUser', randomUser);
		await this.friendsService.addFriendRequest(user, randomUser);
		if (randomNb == 2)
			await this.friendsService.removeFriendship(randomUser, user);
		else if (randomNb >= 3)
			await this.friendsService.acceptFriendRequest(randomUser, user);
		return randomUser;
	}

	private async getUsersIds(): Promise<number[]> {
		const sqlStatement: SelectQueryBuilder<User> = this.usersService.getRepo().createQueryBuilder("user").select(["user.id"]);

		return await sqlStatement.getMany().then((users: User[]) => {
			return users.map(u => u.id);
		}, this.usersService.lambdaDatabaseUnvailable);
	}
}
