/** @prettier */
import { ForbiddenException, forwardRef, Inject, Injectable, NotAcceptableException, NotImplementedException, PreconditionFailedException, Res, UnauthorizedException, UnprocessableEntityException, UnsupportedMediaTypeException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { ArrayContains, InsertResult, Repository } from 'typeorm';
import { Channel, ChannelFront, ChannelPrivate, ChannelProtected, ChannelPublic } from './entity/channel.entity';
import { Chat, ChatFront, ChatStatus } from './entity/chat.entity';
import { Message, MessageFront } from './entity/message.entity';
import { User } from 'users/entity/user.entity';
import { Discussion, DiscussionFront } from './entity/discussion.entity';
import { fromBase64, removeFromArray, removesFromArray, toBase64, validateDTOforHttp } from '../utils/utils';
import { Response } from 'express';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ChannelCreateDTO, ChannelEditDTO, ChannelFetchDTO } from './entity/channel-dto';
import { hashPassword } from '../utils/bcrypt';
import { validate, validateOrReject, ValidationError, Validator } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SocketService } from 'socket/socket.service';
import { WsException } from '@nestjs/websockets';
import { ChatRead } from './entity/chat-read.entity';

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
		private msgRepo: Repository<Message>,
		@InjectRepository(ChatRead)
		private chatReadRepo: Repository<ChatRead>
	) {}

	@Inject(forwardRef(() => UsersService))
	private readonly userService: UsersService;
	@Inject(forwardRef(() => SocketService))
	private readonly socketService: SocketService;

	public getUserService() {
		return this.userService;
	}

	public getRepoChat() {
		return this.chatRepo;
	}

	public getRepoMsg() {
		return this.msgRepo;
	}

    async findAllChannels(userCached: User[] | null) : Promise<ChatFront[]> {
		if (!userCached)
			userCached = new Array();
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

    async findUserChannel(user: User, userCached: User[] | null) : Promise<ChannelFront[]> {
		if (!userCached)
			userCached = new Array();
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

    async findUserDiscussion(user: User, usersCached: User[] | null) : Promise<DiscussionFront[]> {
		if (!usersCached)
			usersCached = new Array();
		// return new Array(); // TODO remove this line
		return await this.discussionRepo.findBy({ users_ids: ArrayContains([user.id]) })
			.then(async (chs: Discussion[]) => {
				const chsFront: DiscussionFront[] = new Array();
				for (const ch of chs)
					chsFront.push(await ch.toFront(this, user, usersCached));
				return chsFront;
			}
		);
    }

    async findOtherChannels(user: User, userCached: User[] | null) : Promise<ChatFront[]> {
		if (!userCached)
			userCached = new Array();
		const publicChannels: ChannelFront[] = await this.channelPublicRepo.find()
			.then(async (chs: ChannelPublic[]) => {
				const chsFront: ChannelFront[] = new Array();
				for (const ch of chs) {
					if (!ch.isIn(user))
						chsFront.push(await ch.toFront(this, null, userCached));
				}
				return chsFront;
			}
		);
		const protectedChannels: ChannelFront[] = await this.channelProtectedRepo.find()
			.then(async (chs: ChannelProtected[]) => {
				const chsFront: ChannelFront[] = new Array();
				for (const ch of chs)
					if (!ch.isIn(user))
						chsFront.push(await ch.toFront(this, null, userCached));
				return chsFront;
			}
		);
		return publicChannels.concat(protectedChannels);
    }

	async fetchMessage(user: User, chatId: number) : Promise<MessageFront[]> {
		let chatRead: ChatRead = null;

		if (user)
			chatRead = await this.chatReadRepo.findOneBy({ id_user: user.id, id_chat: chatId });
	
		return await this.msgRepo.findBy({ id_channel: chatId })
			.then(async (msgs: Message[]) => {
				const msgsFront: MessageFront[] = new Array();
				for (const msg of msgs)
					msgsFront.push(msg.toFront(chatRead));
				return msgsFront;
			}
		);
	}

	async fetchMessageSafe(user: User, channelDTO: ChannelFetchDTO) : Promise<MessageFront[]> {
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
		return this.fetchMessage(user, channelDTO.id);
	}

	async fetchChannel(user: User, channelId: number, channelType: ChatStatus): Promise<ChannelProtected | ChannelPublic | ChannelPrivate> {
		let chat: ChannelPublic | ChannelProtected | ChannelPrivate;
	
		switch (channelType) {
			case ChatStatus.PUBLIC:
				chat = await this.channelPublicRepo.findOneBy({ id: channelId });
				delete chat.avatar_64;
				break;
			case ChatStatus.PROTECTED:
				chat = await this.channelProtectedRepo.findOneBy({ id: channelId });
				delete chat.avatar_64;
				break;
			case ChatStatus.PRIVATE:
				chat = await this.channelPrivateRepo.findOneBy({ id: channelId });
				delete chat.avatar_64;
				break;
			default:
				throw new NotAcceptableException(`Unknown channel type ${channelType}.`)
		}
		return chat;
	}

	async findChat(channelId: number) {
		return await this.chatRepo.findOneBy({ id: channelId });
	}

	async fetchChat(user: User, channelId: number, channelType: ChatStatus): Promise<ChannelProtected | Discussion | ChannelPublic | ChannelPrivate> {
		let chat: ChannelPublic | ChannelProtected | ChannelPrivate | Discussion;
	
		switch (channelType) {
			case ChatStatus.PUBLIC:
				chat = await this.channelPublicRepo.findOneBy({ id: channelId });
				delete chat.avatar_64;
				break;
			case ChatStatus.PROTECTED:
				chat = await this.channelProtectedRepo.findOneBy({ id: channelId });
				delete chat.avatar_64;
				break;
			case ChatStatus.PRIVATE:
				chat = await this.channelPrivateRepo.findOneBy({ id: channelId });
				delete chat.avatar_64;
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

	private async findChannelAvatar(channel: Channel, @Res() res: Response) {
		const avatar: { imageType: any; imageBuffer: any; } = fromBase64(channel.avatar_64);
		if (!avatar)
			throw new UnprocessableEntityException(`Can't get a picture from channel ${channel.name}.`);
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

		await validateDTOforHttp(plainToInstance(ChannelCreateDTO, channelDTO));
		switch (channelDTO.type) {
			case ChatStatus.PUBLIC:
				channel = new ChannelPublic();
				break;
			case ChatStatus.PROTECTED:
				channel = new ChannelProtected();
				if (!channelDTO.password)
					throw new WsException(`Password is empty.`);
				try {
					(channel as ChannelProtected).password = await hashPassword(channelDTO.password);
				} catch (err) {
					throw new WsException(`Can't hash password : ${err.message}.`);
				}
				break;
			case ChatStatus.PRIVATE:
				channel = new ChannelPrivate();
				break;
			default:
				throw new WsException(`Unknown channel type ${channelDTO.type}.`)
		}
		channel.name = channelDTO.name;
		if (channelDTO.avatar_64.startsWith('src/assets/')) {
			channel.avatar_64 = await toBase64(`http://${process.env.FRONT_HOSTNAME_FOR_API}:${process.env.FRONT_PORT}/${channelDTO.avatar_64}`);
			if (!channel.avatar_64)
				throw new WsException(`Bad channel avatar '${process.env.FRONT_PORT}/${channelDTO.avatar_64}'`);
		} else {
			channel.avatar_64 = channelDTO.avatar_64;
		}
		channel.type = channelDTO.type;
		channel.users_ids = channelDTO.users_ids;
	
		channel.owner_id = user.id;
		if (channel.users_ids == null)
			channel.users_ids = [user.id];
		else if (channel.users_ids.indexOf(user.id) == -1)
			channel.users_ids.push(user.id);
		channel = await this.addChatToDB(channel) as Channel;


		let msg: Message = new Message();
		msg.message = `[DEBUG MSG CREATED BY BACK] ⚪️　${user.username} been added to ${channel.name} by ${user.username}`;
		msg.id_sender = -1;
		msg.id_channel = channel.id;
		msg = await this.addMessage(msg);
		return channel;
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

	async findOrCreateDiscussion(userId: number, targetId: number): Promise<Discussion> {
		let discu: Discussion = await this.findDiscussion(userId, targetId);
		if (!discu) {
			discu = new Discussion();
			discu.type = ChatStatus.DISCUSSION;
			discu.users_ids = [userId, targetId];
			discu = await this.addDiscussion(discu);
		}
		return discu;
	}

	async addDiscussion(newDiscu: Discussion): Promise<Discussion> {
		const discu: Discussion = await this.discussionRepo.findOneBy({ users_ids: ArrayContains(newDiscu.users_ids) })
		if (discu)
			throw new NotAcceptableException(`They is already a discussion between ${newDiscu.users_ids[0]} and ${newDiscu.users_ids[1]}.`);
		return this.discussionRepo.save(newDiscu);
	}

	async findDiscussion(userId: number, targetId: number): Promise<Discussion> {
		return await this.discussionRepo.findOneBy({ users_ids: ArrayContains([userId, targetId]) })
	}

	async createMessage(channel: ChannelFront, msgFront: MessageFront) {
		const msg: Message = new Message();
		msg.id_sender = channel.id;
		msg.id_channel =  msgFront.idSender;
		msg.message = msgFront.message;
		// await validateDTOforHttp(plainToInstance(ChannelCreateDTO, Message));
		return await this.addMessage(msg);
	}

	async addMessage(msg: Message): Promise<Message> {
		return this.msgRepo.save(msg);
	}

	async addMessages(msg: QueryDeepPartialEntity<Message> | QueryDeepPartialEntity<Message>[]): Promise<InsertResult> {
		return this.msgRepo.insert(msg);
	}
	
	async findMessage(idMsg: number): Promise<Message> {
		return await this.msgRepo.findOneBy({ id: idMsg });
	}

	async setAdmin(channel: Channel, users_ids: number[]): Promise<ChannelPublic | ChannelProtected | ChannelPrivate> {
		switch (channel.type) {
			case ChatStatus.PUBLIC:
				this.channelPublicRepo.update(channel.id, { admins_ids: users_ids });
				return this.channelPublicRepo.findOneBy({ id: channel.id });
			case ChatStatus.PROTECTED:
				this.channelProtectedRepo.update(channel.id, { admins_ids: users_ids });
				return this.channelProtectedRepo.findOneBy({ id: channel.id });
			case ChatStatus.PRIVATE:
				this.channelPrivateRepo.update(channel.id, { admins_ids: users_ids });
				return this.channelPrivateRepo.findOneBy({ id: channel.id });
			default:
				throw new NotAcceptableException(`Unknown channel type ${channel.type}.`)
		}
	}

	async setMuted(channel: Channel, users_ids: number[]): Promise<ChannelPublic | ChannelProtected | ChannelPrivate> {
		switch (channel.type) {
			case ChatStatus.PUBLIC:
				this.channelPublicRepo.update(channel.id, { muted_ids: users_ids });
				return this.channelPublicRepo.findOneBy({ id: channel.id });
			case ChatStatus.PROTECTED:
				this.channelProtectedRepo.update(channel.id, { muted_ids: users_ids });
				return this.channelProtectedRepo.findOneBy({ id: channel.id });
			case ChatStatus.PRIVATE:
				this.channelPrivateRepo.update(channel.id, { muted_ids: users_ids });
				return this.channelPrivateRepo.findOneBy({ id: channel.id });
			default:
				throw new NotAcceptableException(`Unknown channel type ${channel.type}.`)
		}
	}

	async setBanned(channel: Channel, users_ids: number[]): Promise<ChannelPublic | ChannelProtected | ChannelPrivate> {
		switch (channel.type) {
			case ChatStatus.PUBLIC:
				this.channelPublicRepo.update(channel.id, { banned_ids: users_ids });
				return this.channelPublicRepo.findOneBy({ id: channel.id });
			case ChatStatus.PROTECTED:
				this.channelProtectedRepo.update(channel.id, { banned_ids: users_ids });
				return this.channelProtectedRepo.findOneBy({ id: channel.id });
			case ChatStatus.PRIVATE:
				this.channelPrivateRepo.update(channel.id, { banned_ids: users_ids });
				return this.channelPrivateRepo.findOneBy({ id: channel.id });
			default:
				throw new NotAcceptableException(`Unknown channel type ${channel.type}.`)
		}
	}

	async inviteUsers(channel: ChannelPrivate, users_ids: number[]): Promise<ChannelPrivate> {
		let invited_ids: number[];
		if (channel.invited_ids == null)
			invited_ids = new Array();
		else
			channel.invited_ids;
		invited_ids = [...invited_ids, ...users_ids]

		this.channelPrivateRepo.update(channel.id, { invited_ids: invited_ids });
		return this.channelPrivateRepo.findOneBy({ id: channel.id });
	}

	async kickUsers(user: User, channel: Channel, users_ids: number[]): Promise<ChannelPublic | ChannelProtected | ChannelPrivate> {

		const leaveMessage = async () => {
			let leaveMessage: Message = new Message();
			leaveMessage.message = `🔴　${users_ids.join(', ')} has been kicked by ${user.username}`;
			leaveMessage.id_sender = user.id;
			leaveMessage.id_channel = channel.id;
			leaveMessage = await this.addMessage(leaveMessage);
			channel.sendMessage(this.socketService, 'chatChannelMessage', leaveMessage.toFront(null));
		};

		users_ids = removesFromArray(channel.users_ids, users_ids);
		channel.users_ids = users_ids;
		switch (channel.type) {
			case ChatStatus.PUBLIC:
				this.channelPublicRepo.update(channel.id, { users_ids: users_ids });
				leaveMessage();
				return this.channelPublicRepo.findOneBy({ id: channel.id });
			case ChatStatus.PROTECTED:
				this.channelProtectedRepo.update(channel.id, { users_ids: users_ids });
				leaveMessage();
				return this.channelProtectedRepo.findOneBy({ id: channel.id });
			case ChatStatus.PRIVATE:
				this.channelPrivateRepo.update(channel.id, { users_ids: users_ids });
				leaveMessage();
				return this.channelPrivateRepo.findOneBy({ id: channel.id });
			default:
				throw new NotAcceptableException(`Unknown channel type ${channel.type}.`)
		}
	}

	async updateProtectedChannel(channel: ChannelEditDTO): Promise<ChannelProtected> {
		let dataUpdate: QueryDeepPartialEntity<ChannelProtected>;

		if (channel.name != null)
			dataUpdate.name = channel.name
		if (channel.password != null)
			dataUpdate.password = channel.password

		this.channelProtectedRepo.update(channel.id, dataUpdate);
		return this.channelProtectedRepo.findOneBy({ id: channel.id });
	}

	async joinChannel(user: User, channel: Channel): Promise<ChannelPublic | ChannelProtected | ChannelPrivate> {
		let dataUpdate: QueryDeepPartialEntity<Channel> = {};

		if (channel.users_ids) {
			if (channel.users_ids.indexOf(user.id) !== -1)
				throw new NotAcceptableException(`${user.username} is already in ${channel.name}.`)
			dataUpdate.users_ids = [...channel.users_ids, user.id];
		} else 
			dataUpdate.users_ids = [user.id];

		const joinMessage = async () => {
			let msg: Message = new Message();
			msg.message = '[DEBUG MSG CREATED BY BACK] ⚪️　' + user.username + ' just joined the channel';
			msg.id_sender = -1;
			msg.id_channel = channel.id;
			msg = await this.addMessage(msg);
			channel.sendMessage(this.socketService, 'chatChannelMessage', msg.toFront(null));
		};
		switch (channel.type) {
			case ChatStatus.PUBLIC:
				await this.channelPublicRepo.update(channel.id, dataUpdate);
				await joinMessage();
				return this.channelPublicRepo.findOneBy({ id: channel.id });
			case ChatStatus.PROTECTED:
				await this.channelProtectedRepo.update(channel.id, dataUpdate);
				await joinMessage();
				return this.channelProtectedRepo.findOneBy({ id: channel.id });
			case ChatStatus.PRIVATE:
				await this.channelPrivateRepo.update(channel.id, dataUpdate);
				await joinMessage();
				return this.channelPrivateRepo.findOneBy({ id: channel.id });
			default:
				throw new NotAcceptableException(`Unknown channel type ${channel.type}.`)
		}
	}

	async leaveChannel(user: User, channel: Channel): Promise<ChannelPublic | ChannelProtected | ChannelPrivate> {
		let dataUpdate: QueryDeepPartialEntity<Channel> = {};

		dataUpdate.users_ids = removeFromArray(channel.users_ids, user.id);
		if (channel.admins_ids && channel.admins_ids.indexOf(user.id) !== -1)
			dataUpdate.admins_ids = removeFromArray(channel.admins_ids, user.id);

		const leaveMessage = async () => {
			let leaveMessage: Message = new Message();
			leaveMessage.message = '[DEBUG MSG CREATED BY BACK] 🔴　' + user.username + ' just leaved the channel';
			leaveMessage.id_sender = user.id;
			leaveMessage.id_channel = channel.id;
			leaveMessage = await this.addMessage(leaveMessage);
			channel.sendMessage(this.socketService, 'chatChannelMessage', leaveMessage.toFront(null));
		};

		switch (channel.type) {
			case ChatStatus.PUBLIC:
				await this.channelPublicRepo.update(channel.id, dataUpdate);
				await leaveMessage();
				return this.channelPublicRepo.findOneBy({ id: channel.id });
			case ChatStatus.PROTECTED:
				await this.channelProtectedRepo.update(channel.id, dataUpdate);
				await leaveMessage();
				return this.channelProtectedRepo.findOneBy({ id: channel.id });
			case ChatStatus.PRIVATE:
				await this.channelPrivateRepo.update(channel.id, dataUpdate);
				await leaveMessage();
				return this.channelPrivateRepo.findOneBy({ id: channel.id });
			default:
				throw new NotAcceptableException(`Unknown channel type ${channel.type}.`)
		}
	}

	async saveMessageToDiscussion(user: User, targetUser: User, msg: string): Promise<Discussion> {
		let discu: Discussion = await this.discussionRepo.findOneBy({ users_ids: ArrayContains([user.id, targetUser.id]) })
		const message: Message = new Message();

		if (!discu) {
			discu = new Discussion();
			discu.users_ids = [user.id, targetUser.id];
			discu.type = ChatStatus.DISCUSSION;
			discu = await this.discussionRepo.save(discu);
		}
		message.id_sender = user.id;
		message.id_channel = discu.id;
		this.addMessage(message);
		// discu.sendMessage(this.socketService, 'chatChannelMessage', discu, message.toFront());
		return discu;
	}

	async setReadMessage(user: User, chatId: number, message: Message) {
		// if (!chat.users_ids || chat.users_ids.indexOf(user.id) === -1)
		// 	throw new WsException('Unable to read a message from a channel where you are not in it.');
		let chatRead: ChatRead = await this.chatReadRepo.findOneBy({ id_user: user.id, id_chat: chatId });
		if (!chatRead)
			await this.chatReadRepo.save({ id_user: user.id, id_chat: chatId, id_message: message.id });
		else if (message.id > chatRead.id_message)
			await this.chatReadRepo.update(user.id, { id_chat: chatId, id_message: message.id });
	}

	async getReadMessage(user: User, channel: Channel) {
		const chatRead: ChatRead = await this.chatReadRepo.findOneBy({ id_user: user.id, id_chat: channel.id });
		if (!chatRead)
			return null;

		return chatRead.id_message;
	}
}
