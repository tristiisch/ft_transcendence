import { Body, Controller, Get, Inject, NotAcceptableException, NotImplementedException, Param, Post } from '@nestjs/common';
import { UserSelectDTO } from 'src/users/entity/user-select.dto';
import { User } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { Friendship } from './entity/friendship.entity';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {

	@Inject(UsersService)
	private readonly usersService: UsersService;

	constructor(private readonly friendsService: FriendsService) {}

	async resolveUsers(func: { (user: User, target: User): any }, userId: number, targetSelect: UserSelectDTO){
		const user: User = await this.usersService.findOne(userId);
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

	@Post('request/add/:id')
	addFriendRequest(@Param('id') id: number, @Body() targetSelect: UserSelectDTO) {
		return this.resolveUsers(this.friendsService.addFriendRequest.bind(this.friendsService), id, targetSelect);
	}

	/**
	 * Same as {@link removeFriend}
	 */
	@Post('request/remove/:id')
	removeFriendRequest(@Param('id') id: number, @Body() targetSelect: UserSelectDTO) {
		return this.resolveUsers(this.friendsService.removeFriendship.bind(this.friendsService), id, targetSelect);
	}

	@Post('accept/:id')
	acceptFriend(@Param('id') id: number, @Body() targetSelect: UserSelectDTO) {
		return this.resolveUsers(this.friendsService.acceptFriendRequest.bind(this.friendsService), id, targetSelect);
	}

	@Post('remove/:id')
	removeFriend(@Param('id') id: number, @Body() targetSelect: UserSelectDTO) {
		return this.resolveUsers(this.friendsService.removeFriendship.bind(this.friendsService), id, targetSelect);
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
