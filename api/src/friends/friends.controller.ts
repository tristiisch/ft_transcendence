/** @prettier */
import { Body, Controller, forwardRef, Get, Inject, NotAcceptableException, NotImplementedException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'auth/guard';
import { UserSelectDTO } from 'users/entity/user-select.dto';
import { User } from 'users/entity/user.entity';
import { UsersService } from 'users/users.service';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {

	constructor(private readonly friendsService: FriendsService) {}

	@Inject(forwardRef(() => UsersService))
	private readonly usersService: UsersService;

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

	@UseGuards(JwtAuthGuard)
	@Get()
	getFriends(@Req() req) {
		const user: User = req.user;
		return this.friendsService.findFriends(user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Get('ids')
	getFriendsIds(@Req() req) {
		const user: User = req.user;
		return this.friendsService.findFriendsIds(user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Get('names')
	getFriendsNames(@Req() req) {
		const user: User = req.user;
		return this.friendsService.findFriendsNames(user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Get('request/pending')
	getFriendRequestsPending(@Req() req) {
		const user: User = req.user;
		return this.friendsService.findPending(user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Get('request/pending/ids')
	getFriendRequestsPendingIds(@Req() req) {
		const user: User = req.user;
		return this.friendsService.findPendingIds(user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Get('request/pending/names')
	getFriendRequestsPendingNames(@Req() req) {
		const user: User = req.user;
		return this.friendsService.findPendingNames(user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Get('request/received')
	getFriendRequestsReceived(@Req() req) {
		const user: User = req.user;
		return this.friendsService.findWaiting(user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Get('request/received/ids')
	getFriendRequestsReceivedIds(@Req() req) {
		const user: User = req.user;
		return this.friendsService.findWaitingIds(user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Get('request/received/names')
	getFriendRequestsReceivedNames(@Req() req) {
		const user: User = req.user;
		return this.friendsService.findWaitingNames(user.id);
	}
}
