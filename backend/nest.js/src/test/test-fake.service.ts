import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FriendsService } from 'src/friends/friends.service';
import { MatchHistory } from 'src/matchs-history/entity/matchstats.entity';
import { MatchsHistoryService } from 'src/matchs-history/matchs-history.service';
import { UserStats } from 'src/stats/entity/userstats.entity';
import { StatsService } from 'src/stats/stats.service';
import { User, UserStatus } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { random, randomElement, randomEnum } from 'src/utils/utils';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';

@Injectable()
export class TestFakeService {

	@Inject(UsersService)
	private readonly usersService: UsersService;
	@Inject(FriendsService)
	private readonly friendsService: FriendsService;
	@Inject(StatsService)
	private readonly statsService: StatsService;
	@Inject(MatchsHistoryService)
	private readonly matchHistoryService: MatchsHistoryService;

	private readonly randomMaxStats = 100;
	private readonly randomMaxScoreGame = 5;

	async generate(nbUsers: number) {
		let data = new Array();
		for (let i: number = 1; i <= nbUsers; ++i) {
			data.push(await this.createFakeUser());
			console.log(i, 'done');
		}
		return data;
	}

	async createFakeUser() {
		const username: string = Math.random().toString(36).substring(2, 9);

		const user: User = await this.initUser(username);
		const stats = await this.initStats(user);
		const allUserIds: number[] = await this.getUsersIds(user.id);
		const matchs = await this.initMatchHistory(user, allUserIds);
		await this.initNewFriendship(user, allUserIds);
		return ({ user, stats, matchs });
	}

	async initUser(username: string): Promise<User> {
		let user: User = new User;
		user.username = username;
		user.login_42 = username;
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
		userStats.wins = random(0, this.randomMaxStats);
		userStats.losses = random(0, this.randomMaxStats);

		return this.statsService.add(userStats);
	}

	async initMatchHistory(user: User, userIds: number[]): Promise<MatchHistory> {
		if (userIds.length === 0) {
			console.log(`Can't find a valid userId for matchHistory of ${JSON.stringify(user)}.`);
			return null;
		}
		const matchHistory: MatchHistory = new MatchHistory();
		
		matchHistory.user_id2 = randomElement(userIds);
		matchHistory.user_id1 = user.id;

		let scoreWinner: number = this.randomMaxScoreGame;
		let scoreLoser: number = random(0, this.randomMaxScoreGame);
		if (random(0, 2) === 1)
			matchHistory.score = [scoreWinner, scoreLoser];
		else
			matchHistory.score = [scoreLoser, scoreWinner];
		return this.matchHistoryService.add(matchHistory);
	}

	async initNewFriendship(user: User, userIds: number[]) {
		if (userIds.length === 0) {
			console.log(`Can't find a valid userId for Friendship of ${JSON.stringify(user)}.`);
			return;
		}
		const randomUserId: number = randomElement(userIds);
		const randomUser: User = await this.usersService.findOne(randomUserId);
		const randomNb: number = random(1, 4);

		await this.friendsService.addFriendRequest(user, randomUser);
		if (randomNb == 1)
			await this.friendsService.removeFriendship(randomUser, user);
		else if (randomNb >= 2)
			await this.friendsService.acceptFriendRequest(randomUser, user);
	}

	private async getUsersIds(except: number): Promise<number[]> {
		const sqlStatement: SelectQueryBuilder<User> = this.usersService.getRepo().createQueryBuilder("user").select(["user.id"]);

		return await sqlStatement.getMany().then((users: User[]) => {
			let ids: number[] = new Array();
			users.forEach(u => {
				if (u.id !== except)
					ids.push(u.id);
			});
			return ids;
		}, this.usersService.lambdaDatabaseUnvailable);
	}
}
