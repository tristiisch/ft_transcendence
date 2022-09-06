/** @prettier */
import { Inject, Injectable, NotAcceptableException, NotImplementedException, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { ArrayContains, Repository } from 'typeorm';
import { Channel, ChannelFront, ChannelProtected, ChannelPublic } from './entity/channel.entity';
import { Chat } from './entity/chat.entity';
import { Message, MessageFront } from './entity/message.entity';
import { User } from 'users/entity/user.entity';
import { Discussion, DiscussionFront } from './entity/discussion.entity';
import { fromBase64 } from '../utils/utils';
import { Response } from 'express';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class ChatService {

	constructor(
		@InjectRepository(Chat)
		private chatRepo: Repository<Chat>,
		@InjectRepository(ChannelPublic)
		private channelPublicRepo: Repository<ChannelPublic>,
		@InjectRepository(ChannelProtected)
		private channelProtectedRepo: Repository<ChannelProtected>,
		@InjectRepository(Discussion)
		private discussionRepo: Repository<Discussion>,
		@InjectRepository(Message)
		private msgRepo: Repository<Message>
	) {}

	@Inject(UsersService)
	private readonly userService: UsersService;

	public getUserService() {
		return this.userService;
	}

	public getRepoChat() {
		return this.chatRepo;
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
		const publicChannels: ChannelFront[] = await this.channelPublicRepo.findBy({ users_ids: ArrayContains([user.id]) })
			.then(async (chs: ChannelPublic[]) => {
				const chsFront: ChannelFront[] = new Array();
				for (const ch of chs)
					chsFront.push(await ch.toFront(this));
				return chsFront;
			}
		);
		const protectedChannels: ChannelFront[] = await this.channelProtectedRepo.findBy({ users_ids: ArrayContains([user.id]) })
			.then(async (chs: ChannelProtected[]) => {
				const chsFront: ChannelFront[] = new Array();
				for (const ch of chs)
					chsFront.push(await ch.toFront(this));
				return chsFront;
			}
		);
		return publicChannels.concat(protectedChannels);
    }

    async findUserDiscussion(user: User) : Promise<DiscussionFront[]> {
		return new Array(); // TODO remove this line
		return await this.discussionRepo.findBy({ users_ids: ArrayContains([user.id]) })
			.then(async (chs: Discussion[]) => {
				const chsFront: DiscussionFront[] = new Array();
				for (const ch of chs)
					chsFront.push(await ch.toFront(this.userService, user));
				return chsFront;
			}
		);
    }

	async fetchMessage(channelId: number) : Promise<MessageFront[]> {
		return await this.msgRepo.findBy({ id_channel: channelId })
			.then(async (msgs: Message[]) => {
				const msgsFront: MessageFront[] = new Array();
				for (const msg of msgs)
					msgsFront.push(msg.toFront());
				return msgsFront;
			}
		);
	}

	async addMessage(msg: QueryDeepPartialEntity<Message> | QueryDeepPartialEntity<Message>[]) {
		return this.msgRepo.insert(msg);
	}

	private async findChannelAvatar(channel: Channel, @Res() res: Response) {
		const avatar: { imageType: any; imageBuffer: any; } = fromBase64(channel.avatar_64);

		res.writeHead(200, { 'Content-Type': avatar.imageType, 'Content-Length': avatar.imageBuffer.length });
		res.end(avatar.imageBuffer);
	}

	async findChannelPublicAvatar(id: number, @Res() res: Response) {
		const channel: Channel = await this.channelPublicRepo.findOneBy({ id: id });
		if (!channel)
			throw new NotAcceptableException(`The public channel ${id} didn't exist.`);

		return this.findChannelAvatar(channel, res);
	}

	async findChannelProtectedAvatar(id: number, @Res() res: Response) {
		const channel: Channel = await this.channelProtectedRepo.findOneBy({ id: id });
		if (!channel)
			throw new NotAcceptableException(`The protected channel ${id} didn't exist.`);

		return this.findChannelAvatar(channel, res);
	}

	async addChannelPublic(channel: ChannelPublic) {
		return this.channelPublicRepo.save(channel);
	}

	async addChannelProtected(channel: ChannelPublic) {
		return this.channelProtectedRepo.save(channel);
	}

	async addDiscussion(discu: Discussion) {
		return this.discussionRepo.save(discu);
	}
}
