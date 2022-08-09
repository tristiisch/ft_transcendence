import { Controller, Inject } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { MatchsHistoryService } from './matchs-history.service';

@Controller('matchs-history')
export class MatchsHistoryController {

	@Inject(UsersService)
	private readonly usersService: UsersService;

	constructor(private readonly matchsHistoryService: MatchsHistoryService) {}
}
