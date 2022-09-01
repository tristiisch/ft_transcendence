/** @prettier */
import { Body, Controller, Get, Inject, NotAcceptableException, NotImplementedException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard';
import { UserSelectDTO } from '../users/entity/user-select.dto';
import { User } from '../users/entity/user.entity';
import { UsersService } from '../users/users.service';
import { Friendship } from './entity/friendship.entity';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {
	@Inject(UsersService)
	private readonly usersService: UsersService;

	constructor(private readonly friendsService: FriendsService) {}

	async resolveUsers(func: { (user: User, target: User): any }, user: User, targetSelect: UserSelectDTO) {
		const target: User = await targetSelect.resolveUser(this.usersService);

		return func(user, target);
	}

	/**
	 * @Debug request used for debug
	 */
	@Get('any')
	getAll() {
		return this.friendsService.findAll();
	}

	/**
	 * @Debug request used for debug
	 */
	@Get('any/:id')
	getAllRelations(@Param('id') id: number) {
		return this.friendsService.findAllRelations(id);
	}

	@UseGuards(JwtAuthGuard)
	@Post('request/add')
	addFriendRequest(@Req() req, @Body() targetSelect: UserSelectDTO) {
		return this.resolveUsers(this.friendsService.addFriendRequest.bind(this.friendsService), req.user, targetSelect);
	}

	/**
	 * Same as {@link removeFriend}
	 */
	@UseGuards(JwtAuthGuard)
	@Post('request/remove')
	removeFriendRequest(@Req() req, @Body() targetSelect: UserSelectDTO) {
		return this.resolveUsers(this.friendsService.removeFriendship.bind(this.friendsService), req.user, targetSelect);
	}

	@UseGuards(JwtAuthGuard)
	@Post('accept')
	acceptFriend(@Req() req, @Body() targetSelect: UserSelectDTO) {
		return this.resolveUsers(this.friendsService.acceptFriendRequest.bind(this.friendsService), req.user, targetSelect);
	}

	@UseGuards(JwtAuthGuard)
	@Post('remove')
	removeFriend(@Req() req, @Body() targetSelect: UserSelectDTO) {
		return this.resolveUsers(this.friendsService.removeFriendship.bind(this.friendsService), req.user, targetSelect);
	}

	@Get(':id')
	getFriends(@Param('id') id: number) {
		return this.friendsService.findFriends(id);
	}

	@Get('ids/:id')
	getFriendsIds(@Param('id') id: number) {
		return this.friendsService.findFriendsIds(id);
	}

	@Get('names/:id')
	getFriendsNames(@Param('id') id: number) {
		return this.friendsService.findFriendsNames(id);
	}

	@Get('request/pending/:id')
	getFriendRequestsPending(@Param('id') id: number) {
		return this.friendsService.findPending(id);
	}

	@Get('request/pending/ids/:id')
	getFriendRequestsPendingIds(@Param('id') id: number) {
		return this.friendsService.findPendingIds(id);
	}

	@Get('request/pending/names/:id')
	getFriendRequestsPendingNames(@Param('id') id: number) {
		return this.friendsService.findPendingNames(id);
	}

	@Get('request/received/:id')
	getFriendRequestsReceived(@Param('id') id: number) {
		return this.friendsService.findWaiting(id);
	}

	@Get('request/received/ids/:id')
	getFriendRequestsReceivedIds(@Param('id') id: number) {
		return this.friendsService.findWaitingIds(id);
	}

	@Get('request/received/names/:id')
	getFriendRequestsReceivedNames(@Param('id') id: number) {
		return this.friendsService.findWaitingNames(id);
	}
}
