/** @prettier */
import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard';
import { UsersService } from 'src/users/users.service';
import { ChatService } from './chat.service';

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
}
