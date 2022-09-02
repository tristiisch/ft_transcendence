/** @prettier */
import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { FriendsService } from '../friends/friends.service';
import { MatchStatsService } from '../game/matchs/matchs.service';
import { StatsService } from '../game/stats/stats.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TestDbService {
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

	async clearAllTables() {
		await this.clearTableUser();
		await this.clearTableFriends();
		await this.clearTableStats();
		await this.clearTableMatchHistory();
		await this.clearTableMatchHistory();
		await this.clearTableAuth();
	}

	async clearTableUser() {
		await this.usersService.getRepo().clear();
	}

	async clearTableFriends() {
		await this.friendsService.getRepo().clear();
	}

	async clearTableStats() {
		await this.statsService.getRepo().clear();
	}

	async clearTableMatchHistory() {
		await this.matchHistoryService.getRepo().clear();
	}

	async clearTableAuth() {
		await this.authService.getRepo().clear();
	}
}
