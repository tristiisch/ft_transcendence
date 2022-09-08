/** @prettier */
import { ForbiddenException, Inject, Injectable, NotAcceptableException, NotImplementedException, Res, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { ArrayContains, Repository } from 'typeorm';
import { Channel, ChannelFront, ChannelPrivate, ChannelProtected, ChannelPublic } from './entity/channel.entity';
import { Chat, ChatFront, ChatStatus } from './entity/chat.entity';
import { Message, MessageFront } from './entity/message.entity';
import { User } from 'users/entity/user.entity';
import { Discussion, DiscussionFront } from './entity/discussion.entity';
import { fromBase64 } from '../utils/utils';
import { Response } from 'express';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ChannelCreateDTO, ChannelFetchDTO } from './entity/channel-dto';
import { hashPassword } from '../utils/bcrypt';

@Injectable()
export class ChatService {

	constructor(
		@InjectRepository(Chat)
		private chatRepo: Repository<Chat>,
		@InjectRepository(ChannelPublic)
		private channelPublicRepo: Repository<ChannelPublic>,
		@InjectRepository(ChannelPrivate)
		private channelPrivateRepo: Repository<ChannelPrivate>,
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

    async findAllChannels() : Promise<ChatFront[]> {
		const userCached: User[] = new Array();
		const publicChannels: ChannelFront[] = await this.channelPublicRepo.find()
			.then(async (chs: ChannelPublic[]) => {
				const chsFront: ChannelFront[] = new Array();
				for (const ch of chs)
					chsFront.push(await ch.toFront(this, null, userCached));
				return chsFront;
			}
		);
		const protectedChannels: ChannelFront[] = await this.channelProtectedRepo.find()
			.then(async (chs: ChannelProtected[]) => {
				const chsFront: ChannelFront[] = new Array();
				for (const ch of chs)
					chsFront.push(await ch.toFront(this, null, userCached));
				return chsFront;
			}
		);
		return publicChannels.concat(protectedChannels);
    }

    async findUserChannel(user: User) : Promise<ChannelFront[]> {
		const userCached: User[] = new Array();
		const publicChannels: ChannelFront[] = await this.channelPublicRepo.findBy({ users_ids: ArrayContains([user.id]) })
			.then(async (chs: ChannelPublic[]) => {
				const chsFront: ChannelFront[] = new Array();
				for (const ch of chs)
					chsFront.push(await ch.toFront(this, user, userCached));
				return chsFront;
			}
		);
		const protectedChannels: ChannelFront[] = await this.channelProtectedRepo.findBy({ users_ids: ArrayContains([user.id]) })
			.then(async (chs: ChannelProtected[]) => {
				const chsFront: ChannelFront[] = new Array();
				for (const ch of chs)
					chsFront.push(await ch.toFront(this, user, userCached));
				return chsFront;
			}
		);
		const privateChannels: ChannelFront[] = await this.channelPrivateRepo.findBy({ users_ids: ArrayContains([user.id]) })
			.then(async (chs: ChannelPrivate[]) => {
				const chsFront: ChannelFront[] = new Array();
				for (const ch of chs)
					chsFront.push(await ch.toFront(this, user, userCached));
				return chsFront;
			}
		);
		return publicChannels.concat(protectedChannels, privateChannels);
    }

    async findUserDiscussion(user: User) : Promise<DiscussionFront[]> {
		// return new Array(); // TODO remove this line
		return await this.discussionRepo.findBy({ users_ids: ArrayContains([user.id]) })
			.then(async (chs: Discussion[]) => {
				const chsFront: DiscussionFront[] = new Array();
				for (const ch of chs)
					chsFront.push(await ch.toFront(this, user));
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

	async fetchMessageSafe(channelDTO: ChannelFetchDTO) : Promise<MessageFront[]> {
		if (!Object.values(ChatStatus).includes(channelDTO.type))
			throw new NotAcceptableException(`Enum ${channelDTO.type} didn't exist in ChatStatus.`)
		if (channelDTO.password && channelDTO.type !== ChatStatus.PROTECTED)
			throw new NotAcceptableException(`You need to add a password to open chat type ${channelDTO.type}.`)
		if (channelDTO.type === ChatStatus.PROTECTED) {
			if (!channelDTO.password)
				throw new UnauthorizedException(`Can't use password '${channelDTO.password}' on chat type ${channelDTO.type}.`)
			const protectedChannel: ChannelProtected = await this.channelProtectedRepo.findOneBy({ id: channelDTO.id });
			if (protectedChannel.password !== channelDTO.password)
				throw new UnauthorizedException(`Wrong password for protected channel ${protectedChannel.name}.`)
		}
		return this.fetchMessage(channelDTO.id);
	}

	async fetchChannel(user: User, channelId: number, channelType: ChatStatus): Promise<ChannelProtected | Discussion | ChannelPublic> {
		let chat: ChannelPublic | ChannelProtected | Discussion;
	
		switch (channelType) {
			case ChatStatus.PUBLIC:
				chat = await this.channelPublicRepo.findOneBy({ id: channelId });
				break;
			case ChatStatus.PROTECTED:
				chat = await this.channelProtectedRepo.findOneBy({ id: channelId });
				break;
			case ChatStatus.PRIVATE:
				chat = await this.channelPrivateRepo.findOneBy({ id: channelId });
				break;
			case ChatStatus.DISCUSSION:
				chat = await this.discussionRepo.findOneBy({ id: channelId });
				break;
			default:
				throw new NotAcceptableException(`Unknown chat type ${channelType}.`)
		}
		/*if (chat instanceof Channel) {
			const channel: Channel = chat as Channel;
			if (channel.users_ids.indexOf(user.id) === -1) {
				delete channel.banned_ids;
				delete channel.muted_ids;
				delete channel.users_ids;
				delete channel.owner_id;
			}
		}*/
		return chat;
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

	async findChannelPrivateAvatar(id: number, @Res() res: Response) {
		const channel: Channel = await this.channelPrivateRepo.findOneBy({ id: id });
		if (!channel)
			throw new NotAcceptableException(`The private channel ${id} didn't exist.`);

		return this.findChannelAvatar(channel, res);
	}

	async createChannel(user: User, channelDTO: ChannelCreateDTO): Promise<Channel> {
		let channel: Channel;

		switch (channelDTO.type) {
			case ChatStatus.PUBLIC:
				channel = new ChannelPublic();
				break;
			case ChatStatus.PROTECTED:
				channel = new ChannelProtected();
				(channel as ChannelProtected).password = await hashPassword(channelDTO.password);
				break;
			case ChatStatus.PRIVATE:
				channel = new ChannelPrivate();
				break;
			default:
				throw new NotAcceptableException(`Unknown channel type ${channelDTO.type}.`)
		}
		channel.name = channelDTO.name;
		channel.avatar_64 = channelDTO.avatar_64;
		channel.type = channelDTO.type;
		channel.users_ids = channelDTO.users_ids;

		channel.owner_id = user.id;
		if (channel.users_ids.indexOf(user.id) == -1)
			channel.users_ids.push(user.id);
		return await this.addChatToDB(channel) as Channel;
	}

	async addChatToDB(chat: ChannelPublic | ChannelProtected | ChannelPrivate | Discussion): Promise<Chat> {
		switch (chat.type) {
			case ChatStatus.PUBLIC:
				return this.channelPublicRepo.save(chat as ChannelPublic);
			case ChatStatus.PROTECTED:
				return this.channelProtectedRepo.save(chat as ChannelProtected);
			case ChatStatus.PRIVATE:
				return this.channelPrivateRepo.save(chat as ChannelPrivate);
			case ChatStatus.DISCUSSION:
				return this.addDiscussion(chat as Discussion);
			default:
				throw new NotAcceptableException(`Unknown chat type ${chat.type}.`)
		}
	}

	async addDiscussion(newDiscu: Discussion) {
		const discu: Discussion = await this.discussionRepo.findOneBy({ users_ids: ArrayContains(newDiscu.users_ids) })
		if (discu)
			throw new NotAcceptableException(`They is already a discussion between ${newDiscu.users_ids[0]} and ${newDiscu.users_ids[1]}.`);
		return this.discussionRepo.save(newDiscu);
	}
}
