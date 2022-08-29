/** @prettier */
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel, Message } from './entity/channel.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
	imports: [UsersModule, TypeOrmModule.forFeature([Channel, Message])],
	providers: [ChatService],
	controllers: [ChatController],
	exports: [ChatService],
})
export class ChatModule {}
