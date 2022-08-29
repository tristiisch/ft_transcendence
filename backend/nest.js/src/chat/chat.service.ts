/** @prettier */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from 'diagnostics_channel';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Message } from './entity/channel.entity';

@Injectable()
export class ChatService {

	constructor(
		@InjectRepository(Channel)
		private channelRepo: Repository<Channel>,
		@InjectRepository(Message)
		private msgRepo: Repository<Message>
	) {}

	@Inject(UsersService)
	private readonly userService: UsersService;

	public getRepoChannel() {
		return this.channelRepo;
	}

	public getRepoMsg() {
		return this.msgRepo;
	}

    async findAll() : Promise<Channel[]> {
		try {
			return await this.channelRepo.find();
		} catch (reason) {
			return this.userService.lambdaDatabaseUnvailable(reason);
		}
    }
}
