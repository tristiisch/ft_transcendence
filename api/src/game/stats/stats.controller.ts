import { Body, Controller, forwardRef, Get, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'auth/guard';
import { UserSelectDTO } from 'users/entity/user-select.dto';
import { User } from 'users/entity/user.entity';
import { UsersService } from 'users/users.service';
import { UserStats } from './entity/userstats.entity';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {

	@Inject(forwardRef(() => UsersService))
	private readonly usersService: UsersService;
	private readonly userPerPage: number = 10;

	constructor(private readonly statsService: StatsService) {}

    /*@Get('leaderboard')
	getLeaderboard() {
		return this.statsService.leaderboard();
	}*/

	@UseGuards(JwtAuthGuard)
    @Get('leaderboard-with-friends')
	async getLeaderboardWithFriends(@Req() req) {
		const user: User = req.user;

		return this.statsService.leaderboardWithFriends(user);
	}

	/**
	 * Won't be used but worked.

    @Get('leaderboard/:page')
	getLeaderboardPage(@Param('page') page: number) {
        const min: number = (page - 1) * this.userPerPage;
        const max: number = this.userPerPage;
		return this.statsService.leaderboardPage(min, max);
	}*/

	@UseGuards(JwtAuthGuard)
    @Post()
	async getStats(@Req() req, @Body() userSelected: UserSelectDTO) {
		const target: User = await userSelected.resolveUser(this.usersService);
		const userStats: UserStats = await this.statsService.findOne(target);
		if (userStats == null)
			return { user_id: target.id, victories: 0, defeats: 0, score: 0, rank: -1 };
		userStats.rank = await this.statsService.getRank(target);
		return userStats;
	}
}
