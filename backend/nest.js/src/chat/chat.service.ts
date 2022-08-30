/** @prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Channel } from './entity/channel.entity';
import { Chat } from './entity/chat.entity';
import { Message } from './entity/message.entity';

@Injectable()
export class ChatService {

	constructor(
		@InjectRepository(Chat)
		private chatRepo: Repository<Chat>,
		@InjectRepository(Channel)
		private channelRepo: Repository<Channel>,
		@InjectRepository(Message)
		private msgRepo: Repository<Message>
	) {}

	@Inject(UsersService)
	private readonly userService: UsersService;

	public getRepoChat() {
		return this.chatRepo;
	}

	public getRepoChannel() {
		return this.channelRepo;
	}

	public getRepoMsg() {
		return this.msgRepo;
	}

    async findAllChannels() : Promise<Chat[]> {
		try {
			return await this.chatRepo.find();
		} catch (reason) {
			return this.userService.lambdaDatabaseUnvailable(reason);
		}
    }

	async addChat(chat: Chat) {
		return this.chatRepo.insert(chat);
	}
}
