import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FriendsService } from 'src/friends/friends.service';
import { MatchHistory } from 'src/matchs-history/entity/matchstats.entity';
import { MatchsHistoryService } from 'src/matchs-history/matchs-history.service';
import { UserStats } from 'src/stats/entity/userstats.entity';
import { StatsService } from 'src/stats/stats.service';
import { User, UserStatus } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';

@Injectable()
export class TestService {

	@Inject(UsersService)
	private readonly usersService: UsersService;
	@Inject(FriendsService)
	private readonly friendsService: FriendsService;
	@Inject(StatsService)
	private readonly statsService: StatsService;
	@Inject(MatchsHistoryService)
	private readonly matchHistoryService: MatchsHistoryService;

	private readonly randomMaxStats = 100;
	private readonly maxScoreGame = 5;

	randomEnumValue = (enumeration: any) => {
		const values = Object.keys(enumeration);
		const enumKey = values[Math.floor(Math.random() * values.length)];
		return enumeration[enumKey];
	}

	async generate(nbUsers: number) {
		let data = new Array();
		for (let i: number = 0; i < nbUsers; ++i) {
			data.push(await this.createFakeUsers());
			console.log(i, 'done');
		}
		return data;
	}

	async createFakeUsers() {
		const username: string = Math.random().toString(36).substring(2, 9);

		const user: User = await this.initUser(username);
		const stats = await this.initStats(user);
		const matchs = await this.initMatchHistory(user);
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
		//user.status = this.randomEnumValue(UserStatus);
		user.status = UserStatus.IN_GAME;
		return await this.usersService.add(user);
	}

	async initStats(user: User): Promise<UserStats> {
		let userStats: UserStats = new UserStats();

		userStats.user_id = user.id;
		userStats.wins = Math.floor(Math.random() * this.randomMaxStats);
		userStats.losses = Math.floor(Math.random() * this.randomMaxStats);

		return this.statsService.add(userStats);
	}

	async initMatchHistory(user: User): Promise<MatchHistory> {
		const matchHistory: MatchHistory = new MatchHistory();
		const userIds: number[] = await this.getUsersIds(user.id);

		if (userIds.length === 0) {
			console.log(`Can't find a valid userId for matchHistory of ${JSON.stringify(user)}.`);
			return null;
		}

		matchHistory.user_id2 = userIds[Math.floor(Math.random() * userIds.length)];
		matchHistory.user_id1 = user.id;

		let scoreWinner : number = this.maxScoreGame;
		let scoreLoser : number = Math.floor(Math.random() * this.maxScoreGame);
		if (Math.floor(Math.random() * 2) === 1)
			matchHistory.score = [scoreWinner, scoreLoser];
		else
			matchHistory.score = [scoreLoser, scoreWinner];
		return this.matchHistoryService.add(matchHistory);
	}

	async isUserExist(userId: number) {
		return await this.usersService.findOne(userId).then(() => {
			return true;
		}, err => {
			if (err instanceof NotFoundException)
				return false;
			throw err;
		});
	}

	async getUsersIds(except: number): Promise<number[]> {
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
