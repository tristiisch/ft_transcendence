/** @prettier */
import { forwardRef, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entity/chat.entity';
import { UsersModule } from '../users/users.module';
import { Message } from './entity/message.entity';
import { Channel, ChannelPrivate, ChannelProtected, ChannelPublic } from './entity/channel.entity';
import { Discussion } from './entity/discussion.entity';
import { SocketModule } from 'socket/socket.module';
import { ChatRead } from './entity/chat-read.entity';

@Module({
	imports: [forwardRef(() => UsersModule), forwardRef(() => SocketModule), TypeOrmModule.forFeature([Chat, ChannelPublic, ChannelProtected, ChannelPrivate, Discussion, Message, ChatRead])],
	providers: [ChatService],
	controllers: [ChatController],
	exports: [ChatService],
})
export class ChatModule {}
