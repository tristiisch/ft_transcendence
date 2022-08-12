import { Inject, Injectable } from '@nestjs/common';
import { FriendsService } from 'src/friends/friends.service';
import { MatchsHistoryService } from 'src/matchs-history/matchs-history.service';
import { StatsService } from 'src/stats/stats.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TestDbService {

	@Inject(UsersService)
	private readonly usersService: UsersService;
	@Inject(FriendsService)
	private readonly friendsService: FriendsService;
	@Inject(StatsService)
	private readonly statsService: StatsService;
	@Inject(MatchsHistoryService)
	private readonly matchHistoryService: MatchsHistoryService;

	async clearAllTables() {
		await this.clearTableUser();
		await this.clearTableFriends();
		await this.clearTableStats();
		await this.clearTableMatchHistory();
	}

	async clearTableUser() {
		await this.usersService.getRepo().clear()
	}

	async clearTableFriends() {
		await this.usersService.getRepo().clear()
	}

	async clearTableStats() {
		await this.usersService.getRepo().clear()
	}

	async clearTableMatchHistory() {
		await this.usersService.getRepo().clear()
	}
}
