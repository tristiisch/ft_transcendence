import { Body, Controller, Delete, Get, Inject, NotAcceptableException, NotImplementedException, Param, Post } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {

	@Inject(UsersService)
	private readonly usersService: UsersService;

	constructor(private readonly friendsService: FriendsService) {}

	// localhost:3000/friends/ids/:id
	@Get(':id')
	getFriends(@Param('id') id: number) {
		return this.friendsService.getFriends(id);
	}

	// localhost:3000/friends/ids/:id
	@Get('ids/:id')
	getFriendsIds(@Param('id') id: number) {
		return this.friendsService.getFriendsIds(id);
	}

	// localhost:3000/friends/names/:id
	@Get('names/:id')
	getFriendsNames(@Param('id') id: number) {
		return this.friendsService.getFriendsNames(id);
	}

	// localhost:3000/friends/add/:id1/:id2
	@Get('add/:id1/:id2')
	addFriends(@Param('id1') id1: number, @Param('id2') id2: number) {
		return this.friendsService.addFriend(id1, id2);
	}

	// localhost:3000/friends/remove/:id1/:id2
	@Delete('remove/:id1/:id2')
	removeFriends(@Param('id1') id1: number, @Param('id2') id2: number) {
		return this.friendsService.removeFriend(id1, id2);
	}

	// localhost:3000/friends/request/pending/:id
	@Get('request/pending/:id')
	getFriendRequestsPending(@Param('id') id: number) {
		return this.friendsService.getFriendsPending(id);
	}

	// localhost:3000/friends/request/pending/ids/:id
	@Get('request/pending/ids/:id')
	getFriendRequestsPendingIds(@Param('id') id: number) {
		return this.friendsService.getFriendsPendingIds(id);
	}

	// localhost:3000/friends/request/pending/names/:id
	@Get('request/pending/names/:id')
	getFriendRequestsPendingNames(@Param('id') id: number) {
		return this.friendsService.getFriendsPendingNames(id);
	}

	// localhost:3000/friends/request/received/:id
	@Get('request/received/:id')
	getFriendRequestsReceived(@Param('id') id: number) {
		return this.friendsService.getFriendsReceived(id);
	}

	// localhost:3000/friends/request/received/ids/:id
	@Get('request/received/ids/:id')
	getFriendRequestsReceivedIds(@Param('id') id: number) {
		return this.friendsService.getFriendsReceivedIds(id);
	}

	// localhost:3000/friends/request/received/names/:id
	@Get('request/received/names/:id')
	getFriendRequestsReceivedNames(@Param('id') id: number) {
		return this.friendsService.getFriendsReceivedNames(id);
	}

	// localhost:3000/friends/request/add/:id1/:id2
	@Get('request/add/:id1/:id2')
	addFriendRequest(@Param('id1') id1: number, @Param('id2') id2: number) {
		return this.friendsService.addFriendRequest(id1, id2);
	}

	// localhost:3000/friends/request/remove/:id1/:id2
	@Delete('request/remove/:id1/:id2')
	removeFriendRequest(@Param('id1') id1: number, @Param('id2') id2: number) {
		return this.friendsService.removeFriendRequest(id1, id2);
	}

}
