/** @prettier */
import { Body, Controller, Get, Inject, NotImplementedException, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { channel } from 'diagnostics_channel';
import { JwtAuthGuard } from '../auth/guard';
import { User } from '../users/entity/user.entity';
import { ChatService } from './chat.service';
import { ChannelCreateDTO, ChannelEditUsersDTO, ChannelFetchDTO, ChannelSelectDTO } from './entity/channel-dto';
import { ChannelFront } from './entity/channel.entity';
import { DiscussionFront } from './entity/discussion.entity';
import { MessageFront } from './entity/message.entity';

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
	@Post('create')
	createChat(@Req() req, @Body() channel: ChannelCreateDTO) {
		const user: User = req.user;
		console.log('add Channel receive', channel);
		throw new NotImplementedException('This feature is under developpement.');
	}

	@UseGuards(JwtAuthGuard)
	@Post('leave')
	leaveChannel(@Req() req, @Body() channel: ChannelSelectDTO) {
		const user: User = req.user;
		const channelId: number = channel.id;
		console.log('leave channel id n°', channelId, 'body', channel);
		throw new NotImplementedException('This feature is under developpement.');
	}

	@UseGuards(JwtAuthGuard)
	@Post('delete')
	deleteChannel(@Req() req, @Body() channel: ChannelSelectDTO) {
		const user: User = req.user;
		const channelId: number = channel.id;
		console.log('delete channel id n°', channelId, 'body', channel);
		throw new NotImplementedException('This feature is under developpement.');
	}

	@UseGuards(JwtAuthGuard)
	@Post('admin')
	addAdmin(@Req() req, @Body() channel: ChannelEditUsersDTO) {
		const user: User = req.user;
		console.log('admin', 'body', channel);
		throw new NotImplementedException('This feature is under developpement.');
	}

	@UseGuards(JwtAuthGuard)
	@Post('ban')
	banUsers(@Req() req, @Body() channel: ChannelEditUsersDTO) {
		const user: User = req.user;
		console.log('ban', 'body', channel);
		throw new NotImplementedException('This feature is under developpement.');
	}

	@UseGuards(JwtAuthGuard)
	@Post('mute')
	muteUsers(@Req() req, @Body() channel: ChannelEditUsersDTO) {
		const user: User = req.user;
		console.log('mute', 'body', channel);
		throw new NotImplementedException('This feature is under developpement.');
	}

	@UseGuards(JwtAuthGuard)
	@Post('kick')
	kickMembers(@Req() req, @Body() body: ChannelEditUsersDTO) {
		const user: User = req.user;
		console.log('kick', 'body', body);
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

	@UseGuards(JwtAuthGuard)
	@Post('fetch-messsages')
	fetchMessages(@Req() req, @Body() channelDTO: ChannelFetchDTO) : Promise<MessageFront[]>  {
		const user: User = req.user;
		console.log('DEBUG fetchMessages body', channelDTO);
		return this.chatService.fetchMessageSafe(channelDTO);
	}

	@UseGuards(JwtAuthGuard)
	@Post('fetch-chat')
	async fetchChat(@Req() req, @Body() channelDTO: ChannelFetchDTO) : Promise<ChannelFront | DiscussionFront>  {
		const user: User = req.user;
		const chat = await this.chatService.fetchChannel(user, channelDTO.id, channelDTO.type);
		return chat.toFront(this.chatService, user);
	}
}
