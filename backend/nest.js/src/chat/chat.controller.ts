/** @prettier */
import { Body, Controller, Get, Inject, NotImplementedException, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard';
import { User } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { ChatService } from './chat.service';
import { ChannelFront } from './entity/channel.entity';
import { DiscussionFront } from './entity/discussion.entity';

@Controller('chat')
export class ChatController {
    
	@Inject(ChatService)
	private readonly chatService: ChatService;
	@Inject(UsersService)
	private readonly usersService: UsersService;

	@UseGuards(JwtAuthGuard)
    @Get('channels')
    getChannels() {
        return this.chatService.findAllChannels();
    }

	@UseGuards(JwtAuthGuard)
    @Get('user-discussions')
    getUserPrivateMessage(@Req() req) {
		const user: User = req.user;
        throw new NotImplementedException('This feature is under developpement.');
    }

	@UseGuards(JwtAuthGuard)
    @Get('user-channels')
    getUserChannels(@Req() req) {
		const user: User = req.user;
        throw new NotImplementedException('This feature is under developpement.');
    }

	@UseGuards(JwtAuthGuard)
    @Post('add-discussion')
    addPrivateMessage(@Req() req, @Body() discu: DiscussionFront) {
		const user: User = req.user;
		console.log('add Discussion receive', discu);
        throw new NotImplementedException('This feature is under developpement.');
    }

	@UseGuards(JwtAuthGuard)
    @Post('add-channel')
    addChannel(@Req() req, @Body() channel: ChannelFront) {
		const user: User = req.user;
		console.log('add Channel receive', channel);
        throw new NotImplementedException('This feature is under developpement.');
    }

	@UseGuards(JwtAuthGuard)
    @Post('leave-channel')
    leaveChannel(@Req() req, @Body() body: any) {
		const user: User = req.user;
		const channelId: number = body.id;
		console.log('leave channel id n°', channelId);
        throw new NotImplementedException('This feature is under developpement.');
    }

	@UseGuards(JwtAuthGuard)
    @Post('delete-channel')
    deleteChannel(@Req() req, @Body() body: any) {
		const user: User = req.user;
		const channelId: number = body.id;
		console.log('delete channel id n°', channelId);
        throw new NotImplementedException('This feature is under developpement.');
    }

	@UseGuards(JwtAuthGuard)
    @Post('delete-discussion')
    deletePrivateMessage(@Req() req, @Body() body: any) {
		const user: User = req.user;
		const channelId: number = body.id;
		console.log('delete private message id n°', channelId, '(id of user ou discu ? idk)');
        throw new NotImplementedException('This feature is under developpement.');
    }

	@UseGuards(JwtAuthGuard)
    @Post('add-admin')
    addAdmin(@Req() req, @Body() body: any) {
		const user: User = req.user;
		const users_ids: number[] = body.users;
		console.log('add admin', users_ids);
        throw new NotImplementedException('This feature is under developpement.');
    }

	@UseGuards(JwtAuthGuard)
    @Post('ban-users')
    banUsers(@Req() req, @Body() body: any) {
		const user: User = req.user;
		const users_ids: number[] = body.users;
		console.log('ban users', users_ids);
        throw new NotImplementedException('This feature is under developpement.');
    }

	@UseGuards(JwtAuthGuard)
    @Post('mute-users')
    muteUsers(@Req() req, @Body() body: any) {
		const user: User = req.user;
		const users_ids: number[] = body.users;
		console.log('mute users', users_ids);
        throw new NotImplementedException('This feature is under developpement.');
    }

	@UseGuards(JwtAuthGuard)
    @Post('kick-users')
    kickMembers(@Req() req, @Body() body: any) {
		const user: User = req.user;
		const users_ids: number[] = body.users;
		console.log('kick users', users_ids);
        throw new NotImplementedException('This feature is under developpement.');
    }
}
