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
		return this.friendsService.findFriends(id);
	}

	// localhost:3000/friends/ids/:id
	@Get('ids/:id')
	getFriendsIds(@Param('id') id: number) {
		return this.friendsService.findFriendsIds(id);
	}

	// localhost:3000/friends/names/:id
	@Get('names/:id')
	getFriendsNames(@Param('id') id: number) {
		return this.friendsService.findFriendsNames(id);
	}

	// localhost:3000/friends/accept/:id2/:id1
	@Get('accept/:id2/:id1')
	makeFriends(@Param('id2') id2: number, @Param('id1') id1: number) {
		return this.friendsService.acceptFriendRequest(id1, id2);
	}

	// localhost:3000/friends/remove/:id1/:id2 SAME AS #removeFriendRequest
	@Delete('remove/:id1/:id2')
	removeFriends(@Param('id1') id1: number, @Param('id2') id2: number) {
		return this.friendsService.removeFriendship(id1, id2);
	}

	// localhost:3000/friends/request/pending/:id
	@Get('request/pending/:id')
	getFriendRequestsPending(@Param('id') id: number) {
		return this.friendsService.findPending(id);
	}

	// localhost:3000/friends/request/pending/ids/:id
	@Get('request/pending/ids/:id')
	getFriendRequestsPendingIds(@Param('id') id: number) {
		return this.friendsService.findPendingIds(id);
	}

	// localhost:3000/friends/request/pending/names/:id
	@Get('request/pending/names/:id')
	getFriendRequestsPendingNames(@Param('id') id: number) {
		return this.friendsService.findPendingNames(id);
	}

	// localhost:3000/friends/request/received/:id
	@Get('request/received/:id')
	getFriendRequestsReceived(@Param('id') id: number) {
		return this.friendsService.findWaiting(id);
	}

	// localhost:3000/friends/request/received/ids/:id
	@Get('request/received/ids/:id')
	getFriendRequestsReceivedIds(@Param('id') id: number) {
		return this.friendsService.findWaitingIds(id);
	}

	// localhost:3000/friends/request/received/names/:id
	@Get('request/received/names/:id')
	getFriendRequestsReceivedNames(@Param('id') id: number) {
		return this.friendsService.findWaitingNames(id);
	}

	// localhost:3000/friends/request/add/:id1/:id2
	@Get('request/add/:id1/:id2')
	addFriendRequest(@Param('id1') id1: number, @Param('id2') id2: number) {
		return this.friendsService.addFriendRequest(id1, id2);
	}

	// localhost:3000/friends/request/remove/:id1/:id2
	@Delete('request/remove/:id1/:id2')
	removeFriendRequest(@Param('id1') id1: number, @Param('id2') id2: number) {
		return this.friendsService.removeFriendship(id1, id2);
	}

}
