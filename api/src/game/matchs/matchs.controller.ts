import { Body, Controller, Get, Inject, NotFoundException, Param, Patch, Post, PreconditionFailedException, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'auth/guard';
import { UserSelectDTO } from 'users/entity/user-select.dto';
import { User } from 'users/entity/user.entity';
import { UsersService } from 'users/users.service';
import { isNumberPositive } from 'utils/utils';
import { Match } from './entity/match.entity';
import { MatchService } from './matchs.service';

@Controller('matchs')
export class MatchsController {

	@Inject(UsersService)
	private readonly usersService: UsersService;

	constructor(private readonly matchService: MatchService) {}

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
		return await this.matchService.findHistory(target.id);
	}

	@UseGuards(JwtAuthGuard)
	@Get('current')
	async getCurrentMatchs() {
		return await this.matchService.findOnlineMatchs();
	}

	@UseGuards(JwtAuthGuard)
	@Post('request/add')
	async addRequestMatch(@Req() req, @Body() body) {
		if (Number.isNaN(body.id) || !body.gameInfo) {
			throw new PreconditionFailedException(`Missing id or matchInfo on request`);
		}
		return await this.matchService.addRequest(req.user, body.id, body.gameInfo);
	}

	@UseGuards(JwtAuthGuard)
	@Get('request/remove')
	removeOwnGameInvitation(@Req() req) {
		const user: User = req.user;

		return this.matchService.removeOwnGameInvitation(user);
	}

	@UseGuards(JwtAuthGuard)
	@Get('request')
	async getRequest(@Req() req) {
		const user: User = req.user;
		const gameinvit = this.matchService.getOwnRequest(user);

		if (!gameinvit)
			return null;
		const target: User = await this.usersService.findOne(gameinvit.toUserId);
		return target;
	}

	@UseGuards(JwtAuthGuard)
	@Get(':id')
	sendMatchInfos(@Param('id') id: string) {
		if (!this.matchService.getMatches().has(id))
			throw new NotFoundException(`Unknown match`);
		let match: Match = this.matchService.getMatches().get(id)
		return {
			id: match.id,
			user1_id: match.user1_id,
			user2_id: match.user2_id,
			user1_username: match.user1_username,
			user2_username: match.user2_username,
			user1_avatar: match.user1_avatar,
			user2_avatar: match.user2_avatar,
			score: match.score,
			world: match.world,
			stageWidth: this.matchService.getStageWidth(),
			racketSize: match.racketSize,
			started: match.started
		}
	}
}
