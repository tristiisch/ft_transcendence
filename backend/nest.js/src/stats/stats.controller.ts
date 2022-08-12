import { Body, Controller, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { UserSelectDTO } from 'src/users/entity/user-select.dto';
import { User } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { UserStats } from './entity/userstats.entity';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {

	@Inject(UsersService)
	private readonly usersService: UsersService;
	private readonly userPerPage: number = 10;

	constructor(private readonly statsService: StatsService) {}

	@Patch(':id')
	changeStats(@Param('id') id: number, @Body() stats: UserStats) {
        stats.user_id = id
		return this.statsService.update(stats);
	}

    @Get(':id')
	getStats(@Param('id') id: number) {
		return this.statsService.findOne(id);
	}

    @Get('leaderboard')
	getLeaderboard(@Param('page') page: number) {
		return this.statsService.leaderboard();
	}

    @Post('leaderboard-with-friends')
	async getLeaderboardWithFriends(@Body() userSelected: UserSelectDTO) {
		const user: User = await userSelected.resolveUser(this.usersService);
	
		return this.statsService.leaderboardWithFriends(user);
	}

	/**
	 * Won't be used but worked.
	 */
    @Get('leaderboard/:page')
	getLeaderboardPage(@Param('page') page: number) {
        const min: number = (page - 1) * this.userPerPage;
        const max: number = this.userPerPage;
		return this.statsService.leaderboardPage(min, max);
	}
}
