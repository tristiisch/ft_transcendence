/** @prettier */
import { Inject, Injectable } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
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
	@Inject(ChatService)
	private readonly chatService: ChatService;

	async clearAllTables() {
		await this.usersService.getRepo().clear();
		await this.friendsService.getRepo().clear();
		await this.statsService.getRepo().clear();
		await this.matchHistoryService.getRepo().clear();
		await this.authService.getRepo().clear();
		await this.chatService.getRepoChat().clear();
	}
}
