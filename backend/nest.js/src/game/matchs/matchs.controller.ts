import { Body, Controller, Get, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guard';
import { UserSelectDTO } from '../../users/entity/user-select.dto';
import { User } from '../../users/entity/user.entity';
import { UsersService } from '../../users/users.service';
import { MatchStats } from './entity/matchstats.entity';
import { MatchStatsService } from './matchs.service';

@Controller('matchs')
export class MatchsStatsController {
	@Inject(UsersService)
	private readonly usersService: UsersService;

	constructor(private readonly matchsService: MatchStatsService) {}

	/**
	 * @deprecated Only for test
	 */

	@UseGuards(JwtAuthGuard)
	@Get('matchmaking')
	async sendMatchId(@Req() req): Promise<number> {
		const user: User = req.user;
		var match: MatchStats = new MatchStats();
		//this.matchsService.getMatches().set(id, { room: io.to('match_' + id), started:false, p1_jwt: socket.id, p2_jwt: null, p1_ypos: 0, p2_ypos: 0 })
		this.matchsService.add(match);
		return 1;
	}

	@Post('start')
	async startMatch(@Body() usersSelected: UserSelectDTO[]): Promise<MatchStats> {
		const user: User = await usersSelected[0].resolveUser(this.usersService);
		const target: User = await usersSelected[1].resolveUser(this.usersService);
		const match: MatchStats = new MatchStats();
		match.user1_id = user.id;
		match.user2_id = target.id;
		return await this.matchsService.add(match);
	}

	@UseGuards(JwtAuthGuard)
	@Post('history')
	async getUserHistory(@Req() req, @Body() userSelected: UserSelectDTO) {
		let target: User;
		const user: User = req.user;

		if (userSelected.isEmpty()) {
			target = user;
		} else {
			target = await userSelected.resolveUser(this.usersService);
		}
		return await this.matchsService.findHistory(target.id);
	}

	/**
	 * @deprecated only for test
	 */
	@Patch(':id')
	async updateMatch(@Body() match: MatchStats) {
		return this.matchsService.save(match);
	}

	@Get('current')
	async getCurrentMatchs() {
		return await this.matchsService.findOnlineMatchs();
	}
}
