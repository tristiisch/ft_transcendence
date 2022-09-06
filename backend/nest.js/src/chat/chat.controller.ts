/** @prettier */
import { Body, Controller, Get, Inject, NotImplementedException, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard';
import { User } from '../users/entity/user.entity';
import { ChatService } from './chat.service';
import { ChannelFront } from './entity/channel.entity';
import { DiscussionFront } from './entity/discussion.entity';

@Controller('chat')
export class ChatController {

	constructor(private readonly chatService: ChatService) {}

	@UseGuards(JwtAuthGuard)
	@Get('channels')
	getChannels() {
		return this.chatService.findAllChannels();
	}

	@UseGuards(JwtAuthGuard)
	@Get('user-discussions')
	getUserPrivateMessage(@Req() req) {
		const user: User = req.user;
		return this.chatService.findUserDiscussion(user);
	}

	@UseGuards(JwtAuthGuard)
	@Get('user-channels')
	getUserChannels(@Req() req) {
		const user: User = req.user;
		return this.chatService.findUserChannel(user);
	}

	@UseGuards(JwtAuthGuard)
	@Post('add-discussion')
	addPrivateMessage(@Req() req, @Body() body) {
		const user: User = req.user;
		const discu: DiscussionFront = body;
		console.log('add Discussion receive', discu, 'body', body);
		throw new NotImplementedException('This feature is under developpement.');
	}

	@UseGuards(JwtAuthGuard)
	@Post('add-channel')
	addChannel(@Req() req, @Body() body) {
		const user: User = req.user;
		const channel: ChannelFront = body;
		console.log('add Channel receive', channel, 'body', body);
		throw new NotImplementedException('This feature is under developpement.');
	}

	@UseGuards(JwtAuthGuard)
	@Post('leave-channel')
	leaveChannel(@Req() req, @Body() body: any) {
		const user: User = req.user;
		const channelId: number = body.id;
		console.log('leave channel id n°', channelId, 'body', body);
		throw new NotImplementedException('This feature is under developpement.');
	}

	@UseGuards(JwtAuthGuard)
	@Post('delete-channel')
	deleteChannel(@Req() req, @Body() body: any) {
		const user: User = req.user;
		const channelId: number = body.id;
		console.log('delete channel id n°', channelId, 'body', body);
		throw new NotImplementedException('This feature is under developpement.');
	}

	@UseGuards(JwtAuthGuard)
	@Post('delete-discussion')
	deletePrivateMessage(@Req() req, @Body() body: any) {
		const user: User = req.user;
		const channelId: number = body.id;
		console.log('delete private message id n°', channelId, '(id of user ou discu ? idk)', 'body', body);
		throw new NotImplementedException('This feature is under developpement.');
	}

	@UseGuards(JwtAuthGuard)
	@Post('add-admin')
	addAdmin(@Req() req, @Body() body: any) {
		const user: User = req.user;
		const users_ids: number[] = body.users;
		console.log('add admin', users_ids, 'body', body);
		throw new NotImplementedException('This feature is under developpement.');
	}

	@UseGuards(JwtAuthGuard)
	@Post('ban-users')
	banUsers(@Req() req, @Body() body: any) {
		const user: User = req.user;
		const users_ids: number[] = body.users;
		console.log('ban users', users_ids, 'body', body);
		throw new NotImplementedException('This feature is under developpement.');
	}

	@UseGuards(JwtAuthGuard)
	@Post('mute-users')
	muteUsers(@Req() req, @Body() body: any) {
		const user: User = req.user;
		const users_ids: number[] = body.users;
		console.log('mute users', users_ids, 'body', body);
		throw new NotImplementedException('This feature is under developpement.');
	}

	@UseGuards(JwtAuthGuard)
	@Post('kick-users')
	kickMembers(@Req() req, @Body() body: any) {
		const user: User = req.user;
		const users_ids: number[] = body.users;
		console.log('kick users', users_ids, 'body', body);
		throw new NotImplementedException('This feature is under developpement.');
	}

	@Get('avatar-public/:id')
	channelAvatarPublic(@Res() res, @Param('id') id: number) {
		return this.chatService.findChannelPublicAvatar(id, res);
	}

	@Get('avatar-protected/:id')
	channelAvatarProtected(@Res() res, @Param('id') id: number) {
		return this.chatService.findChannelProtectedAvatar(id, res);
	}
}
