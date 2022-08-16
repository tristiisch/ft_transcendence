import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { UserSelectDTO } from 'src/users/entity/user-select.dto';
import { User } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { MatchStats } from './entity/matchstats.entity';
import { MatchStatsService } from './matchs.service';

@Controller('matchs')
export class MatchsStatsController {

	@Inject(UsersService)
	private readonly usersService: UsersService;

	constructor(private readonly matchsHistoryService: MatchStatsService) {}

	/**
	 * @deprecated Only for test
	 */
	@Post('start')
	async startMatch(@Body() usersSelected: UserSelectDTO[]) {
		const user: User = await usersSelected[0].resolveUser(this.usersService);
		const target: User = await usersSelected[1].resolveUser(this.usersService);
		const match: MatchStats = new MatchStats();
		match.user_id1 = user.id;
		match.user_id2 = target.id;
		return await this.matchsHistoryService.add(match);
	}

	@Post('history')
	async getUserHistory(@Body() userSelected: UserSelectDTO) {
		const user: User = await userSelected.resolveUser(this.usersService);

		return await this.matchsHistoryService.findAll(user.id);
	}
}
