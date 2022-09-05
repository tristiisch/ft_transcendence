/** @prettier */
import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { Channel, ChannelFront } from './entity/channel.entity';
import { Chat, ChatStatus } from './entity/chat.entity';
import { Message, MessageFront } from './entity/message.entity';
import { User } from 'users/entity/user.entity';
import { DiscussionFront } from './entity/discussion.entity';

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

    async findUserChannel(user: User) : Promise<ChannelFront[]> {
		const msg: MessageFront = new MessageFront();
		const channels: ChannelFront[] = new Array();
		let channel: ChannelFront = new ChannelFront();

		msg.idSender = user.id;
		msg.idMessage = 0;
		msg.date = new Date().toLocaleTimeString();
		msg.message = 'Hello world !';
		msg.idChat = 0;
	
		channel = {
			id: 0,
			name: 'Exemple Fake Channel',
			owner: user,
			avatar: 'https://s2.coinmarketcap.com/static/img/coins/64x64/8537.png',
			password: undefined,
			users: [user],
			admins: [user],
			muted: [],
			banned: [],
			type: ChatStatus.PUBLIC,
			messages: [msg]
		}
		channels.push(channel);
		return channels;
    }

    async findUserDiscussion(user: User) : Promise<DiscussionFront[]> {
		const discussions: DiscussionFront[] = new Array();
		const msg: MessageFront = new MessageFront();

		msg.idSender = user.id;
		msg.idMessage = 0;
		msg.date = new Date().toLocaleTimeString();
		msg.message = 'Hello world !';
		msg.idChat = 0;

		discussions.push({
			id: 0,
			type: ChatStatus.DISCUSSION,
			user: user,
			messages: [msg]
		})
		return discussions;
    }

	async addChat(chat: Chat) {
		return this.chatRepo.insert(chat);
	}
}
