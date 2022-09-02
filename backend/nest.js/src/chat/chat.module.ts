/** @prettier */
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entity/chat.entity';
import { UsersModule } from '../users/users.module';
import { Message } from './entity/message.entity';
import { Channel } from 'diagnostics_channel';

@Module({
	imports: [UsersModule, TypeOrmModule.forFeature([Chat, Channel, Message])],
	providers: [ChatService],
	controllers: [ChatController],
	exports: [ChatService],
})
export class ChatModule {}
