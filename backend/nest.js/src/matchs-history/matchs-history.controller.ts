import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { UserSelectDTO } from 'src/users/entity/user-select.dto';
import { User } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { MatchsHistoryService } from './matchs-history.service';

@Controller('matchs-history')
export class MatchsHistoryController {

	@Inject(UsersService)
	private readonly usersService: UsersService;

	constructor(private readonly matchsHistoryService: MatchsHistoryService) {}

	@Post()
	async getUserHistory(@Body() userSelected: UserSelectDTO) {
		const user: User = await userSelected.resolveUser(this.usersService);

		return await this.matchsHistoryService.findAll(user.id);
	}
}
