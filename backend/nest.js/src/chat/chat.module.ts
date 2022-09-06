/** @prettier */
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entity/chat.entity';
import { UsersModule } from '../users/users.module';
import { Message } from './entity/message.entity';
import { Channel, ChannelProtected, ChannelPublic } from './entity/channel.entity';
import { Discussion } from './entity/discussion.entity';

@Module({
	imports: [UsersModule, TypeOrmModule.forFeature([Chat, ChannelPublic, ChannelProtected, Discussion, Message])],
	providers: [ChatService],
	controllers: [ChatController],
	exports: [ChatService],
})
export class ChatModule {}
