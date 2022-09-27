import { Body, Controller, Get, Inject, NotFoundException, Param, Patch, Post, PreconditionFailedException, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'auth/guard';
import { UserSelectDTO } from 'users/entity/user-select.dto';
import { User } from 'users/entity/user.entity';
import { UsersService } from 'users/users.service';
import { isNumberPositive } from 'utils/utils';
import { Match } from './entity/match.entity';
import { MatchStatsService } from './matchs.service';

@Controller('matchs')
export class MatchsStatsController {

	@Inject(UsersService)
	private readonly usersService: UsersService;

	constructor(private readonly matchsService: MatchStatsService) {}

	@Post('start')
	async startMatch(@Body() usersSelected: UserSelectDTO[]): Promise<Match> {
		const user: User = await usersSelected[0].resolveUser(this.usersService);
		const target: User = await usersSelected[1].resolveUser(this.usersService);
		const match: Match = new Match();
		match.user1_id = user.id;
		match.user2_id = target.id;
		return await this.matchsService.save(match);
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

	@UseGuards(JwtAuthGuard)
	@Get('current')
	async getCurrentMatchs() {
		return await this.matchsService.findOnlineMatchs();
	}

	@UseGuards(JwtAuthGuard)
	@Post('request/add')
	async addRequestMatch(@Req() req, @Body() body) {
		if (Number.isNaN(body.id) || !body.gameInfo) {
			throw new PreconditionFailedException(`Missing id or matchInfo on request`);
		}
		return await this.matchsService.addRequest(req.user, body.id, body.gameInfo);
	}

	/**
	 * @deprecated Only for test
	 */

	 @UseGuards(JwtAuthGuard)
	 @Get(':id')
	 sendMatchInfos(@Param('id') id: string) {
		if (!this.matchsService.getMatches().has(id))
			throw new NotFoundException(`Unknown match`);
		let match = this.matchsService.getMatches().get(id)
		return {
			id: match.id,
			user1_id: match.user1_id,
			user2_id: match.user2_id,
			user1_username: match.user1_username,
			user2_username: match.user2_username,
			user1_avatar: match.user1_avatar,
			user2_avatar: match.user2_avatar,
			score: [0, 0]
		}
	 }
}
