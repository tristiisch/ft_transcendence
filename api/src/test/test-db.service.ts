/** @prettier */
import { Inject, Injectable } from '@nestjs/common';
import { ChatService } from 'chat/chat.service';
import { AuthService } from 'auth/auth.service';
import { FriendsService } from 'friends/friends.service';
import { MatchService } from 'game/matchs/matchs.service';
import { StatsService } from 'game/stats/stats.service';
import { UsersService } from 'users/users.service';

@Injectable()
export class TestDbService {
	@Inject(UsersService)
	private readonly usersService: UsersService;
	@Inject(FriendsService)
	private readonly friendsService: FriendsService;
	@Inject(StatsService)
	private readonly statsService: StatsService;
	@Inject(MatchService)
	private readonly matchHistoryService: MatchService;
	@Inject(AuthService)
	private readonly authService: AuthService;
	@Inject(ChatService)
	private readonly chatService: ChatService;

	async clearAllTables() {
		await this.usersService.getRepo().clear();
		await this.friendsService.getRepo().clear();
		await this.statsService.getRepo().clear();
		await this.matchHistoryService.getRepo().clear();
		this.matchHistoryService.getMatches().clear();
		await this.authService.getRepo().clear();
		await this.chatService.getRepoChat().clear();
		await this.chatService.getRepoMsg().clear();
	}

	async clearChat() {
		await this.chatService.getRepoChat().clear();
		await this.chatService.getRepoMsg().clear();
	}
}
