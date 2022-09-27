/** @prettier */
import { Body, Controller, Get, Inject, NotImplementedException, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { channel } from 'diagnostics_channel';
import { JwtAuthGuard } from 'auth/guard';
import { User } from 'users/entity/user.entity';
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
	getChannels(@Req() req) {
		const user: User = req.user;
		return this.chatService.findOtherChannels(user, [user]);
	}

	@UseGuards(JwtAuthGuard)
	@Get('user-discussions')
	getUserPrivateMessage(@Req() req) {
		const user: User = req.user;
		return this.chatService.findUserDiscussion(user, [user]);
	}

	@UseGuards(JwtAuthGuard)
	@Get('user-channels')
	getUserChannels(@Req() req) {
		const user: User = req.user;
		return this.chatService.findUserChannel(user, [user]);
	}

	@Get('avatar-public/:id')
	channelAvatarPublic(@Res() res, @Param('id') id: number) {
		return this.chatService.findChannelPublicAvatar(id, res);
	}

	@Get('avatar-protected/:id')
	channelAvatarProtected(@Res() res, @Param('id') id: number) {
		return this.chatService.findChannelProtectedAvatar(id, res);
	}

	@Get('avatar-private/:id')
	channelAvatarPrivate(@Res() res, @Param('id') id: number) {
		return this.chatService.findChannelPrivateAvatar(id, res);
	}

	// TODO remove it
	@UseGuards(JwtAuthGuard)
	@Post('fetch-messsages')
	fetchMessages(@Req() req, @Body() channelDTO: ChannelFetchDTO) : Promise<MessageFront[]>  {
		const user: User = req.user;
		return this.chatService.fetchMessageSafe(user, channelDTO);
	}

	// TODO remove it
	@UseGuards(JwtAuthGuard)
	@Post('fetch-chat')
	async fetchChat(@Req() req, @Body() channelDTO: ChannelFetchDTO) : Promise<ChannelFront | DiscussionFront>  {
		const user: User = req.user;
		const chat = await this.chatService.fetchChat(user, channelDTO.id, channelDTO.type);
		return chat.toFront(this.chatService, user, null);
	}
}
