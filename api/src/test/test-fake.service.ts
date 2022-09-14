/** @prettier */
import { Inject, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { FriendsService } from '../friends/friends.service';
import { MatchStats } from '../game/matchs/entity/matchstats.entity';
import { MatchStatsService } from '../game/matchs/matchs.service';
import { UserStats } from '../game/stats/entity/userstats.entity';
import { StatsService } from '../game/stats/stats.service';
import { UserSelectDTO } from '../users/entity/user-select.dto';
import { User, UserStatus } from '../users/entity/user.entity';
import { UsersService } from '../users/users.service';
import { randomNumber, randomElement, randomElements, randomEnum, removeFromArray, removesFromArray, toBase64, randomWord } from '../utils/utils';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { UserAuth } from '../auth/entity/user-auth.entity';
import { ChannelProtected, ChannelPublic } from 'chat/entity/channel.entity';
import { Chat, ChatStatus } from '../chat/entity/chat.entity';
import { ChatService } from '../chat/chat.service';
import { Discussion } from 'chat/entity/discussion.entity';
import { Message } from 'chat/entity/message.entity';

@Injectable()
export class TestFakeService {
	@Inject(UsersService)
	private readonly usersService: UsersService;
	@Inject(FriendsService)
	private readonly friendsService: FriendsService;
	@Inject(StatsService)
	private readonly statsService: StatsService;
	@Inject(MatchStatsService)
	private readonly matchHistoryService: MatchStatsService;
	@Inject(AuthService)
	private readonly authService: AuthService;
	@Inject(ChatService)
	private readonly chatService: ChatService;

	private readonly randomMaxStats = 100;
	private readonly randomMaxScoreGame = 5;

	async generate(nbUsers: number) {
		const data = new Array();
		const allUserIds: number[] = await this.getUsersIds();
		for (let i: number = 1; i <= nbUsers; ++i) {
			let fakeUser: { user: User; matchs: MatchStats } = await this.createFakeUser(allUserIds);
			data.push(fakeUser);
			allUserIds.push(fakeUser.user.id);
		}
		return data;
	}

	async createFakeUser(allUserIds: number[]): Promise<{ user: User; matchs: MatchStats }> {
		const user: User = await this.initUser();
		const allUserIdsExceptUser: number[] = removeFromArray(allUserIds, user.id);

		const matchs: MatchStats = await this.initMatchHistory(user, allUserIdsExceptUser);
		const usersWithoutRelation: number[] = removesFromArray(allUserIdsExceptUser, await this.friendsService.findAllRelationsId(user.id));

		this.initNewFriendship(user, usersWithoutRelation);
		return { user, matchs };
	}

	async addFakeData(user: User): Promise<{ statusCode: number; message: string }> {
		const allUserIdsExceptUser: number[] = removeFromArray(await this.getUsersIds(), user.id);

		let iMatchs = -1;
		while (++iMatchs < allUserIdsExceptUser.length) {
			const matchs: MatchStats = await this.initMatchHistory(user, allUserIdsExceptUser);
			if (matchs == null) break;
		}
		const userWithRelationsIds: number[] = await this.friendsService.findAllRelationsId(user.id);
		let usersWithoutRelation: number[] = removesFromArray(allUserIdsExceptUser, userWithRelationsIds);

		for (const u of userWithRelationsIds) {

			if (usersWithoutRelation.indexOf(u) != -1) {
				throw new NotAcceptableException(`You want to add a relationship between ${user.username} & ${u}, but they already have a relationship.`);
			}
		}

		let iFriends = -1;
		while (++iFriends < usersWithoutRelation.length) {
			const target: UserSelectDTO = await this.initNewFriendship(user, usersWithoutRelation);
			if (!target) break;
			removeFromArray(usersWithoutRelation, target.id);
		}
		return { statusCode: 200, message: `${iMatchs} matches and ${iFriends} friend relationships are added.` };
	}

	async initUser(): Promise<User> {
		let user: User = new User();
		let userAuth: UserAuth;
		let userStats: UserStats;
	
		user.username = randomWord(randomNumber(3, 16));
		user.login_42 = randomWord(32);
		user.avatar_64 = await toBase64('https://picsum.photos/200');
		user.status = randomEnum(UserStatus);
	
		user = await this.usersService.add(user);
		userAuth = new UserAuth(user.id);
		userAuth.token_jwt = await this.authService.createToken(user.id);
		await this.authService.save(userAuth);

		userStats = new UserStats(user.id);
		await this.statsService.add(userStats);

		return user;
	}

	async initMatchHistory(user: User, userIds: number[]): Promise<MatchStats> {
		if (userIds.length === 0) {
			console.log(`Can't find a valid userId for matchHistory of ${JSON.stringify(user)}.`);
			return null;
		}
		const targetId: number = randomElement(userIds);
		const matchHistory: MatchStats = new MatchStats();

		if (randomNumber(0, 2) === 1) {
			matchHistory.user2_id = user.id;
			matchHistory.user1_id = targetId;
		} else {
			matchHistory.user1_id = user.id;
			matchHistory.user2_id = targetId;
		}

		if (randomNumber(0, 4) >= 1) {
			const scoreWinner: number = this.randomMaxScoreGame;
			const scoreLoser: number = randomNumber(0, this.randomMaxScoreGame);
			if (randomNumber(0, 2) === 1) {
				matchHistory.score = [scoreWinner, scoreLoser];
			} else {
				matchHistory.score = [scoreLoser, scoreWinner];
			}
			matchHistory.timestamp_ended = new Date();
			matchHistory.timestamp_ended.setMinutes(matchHistory.timestamp_ended.getMinutes() + randomNumber(5, 60));

			if (matchHistory.getWinner() === user.id) {
				await this.statsService.addVictory(user.id)
				await this.statsService.addDefeat(targetId)
			} else if (matchHistory.getWinner() === targetId) {
				await this.statsService.addVictory(targetId)
				await this.statsService.addDefeat(user.id)
			} else {
				throw new NotAcceptableException(`They is no winner in the match ${JSON.stringify(matchHistory)}.`);
			}
		} else {
			const scoreUser1: number = randomNumber(0, this.randomMaxScoreGame);;
			const scoreUser2: number = randomNumber(0, this.randomMaxScoreGame);
			matchHistory.score = [scoreUser1, scoreUser2];
		}
		return await this.matchHistoryService.add(matchHistory);
	}

	async initNewFriendship(user: User, userIds: number[]): Promise<UserSelectDTO> {
		if (userIds.length === 0) {
			console.log(`Can't find a valid userId for Friendship of ${JSON.stringify(user)}.`);
			return null;
		}
		const randomTarget: UserSelectDTO = new UserSelectDTO();
		randomTarget.id = randomElement(userIds);

		const target: User = await randomTarget.resolveUser(this.usersService);

		await this.friendsService.addFriendRequest(user, target);

		/* Only to test notif friendship. Should be uncommented later
		const randomNb: number = random(1, 4);

		if (randomNb == 2) await this.friendsService.removeFriendship(randomUser, user);
		else if (randomNb >= 3) await this.friendsService.acceptFriendRequest(randomUser, user);*/
		return randomTarget;
	}

	private async getUsersIds(): Promise<number[]> {
		const sqlStatement: SelectQueryBuilder<User> = this.usersService.getRepo().createQueryBuilder('user').select(['user.id']);

		return await sqlStatement.getMany().then((users: User[]) => {
			return users.map((u) => u.id);
		}, this.usersService.lambdaDatabaseUnvailable);
	}

	async addChats(user: User, nb: number) {
		const allUserIdsExceptUser: number[] = removeFromArray(await this.getUsersIds(), user.id);
		const chatCreated: Chat[] = new Array();
		
		if (Number.isNaN(nb) || nb <= 0)
			nb = 1
		for (let i = 0; i < nb; ++i) {
			const ch: Chat = await this.createFakeChannel(user, allUserIdsExceptUser);
			if (ch)
				chatCreated.push(ch);
		}
		return { statusCode: 200, message: `${chatCreated.length} chats created.` };
	}

	private async createFakeChannel(user: User, usersIds: number[]): Promise<Chat> {
		const type: ChatStatus = randomEnum(ChatStatus);
		let newChat: ChannelPublic | ChannelProtected | Discussion;

		switch (type) {
			case ChatStatus.PUBLIC:
				newChat = {
					name: `${ChatStatus[type]}_${randomWord(randomNumber(3, 32))}`,
					owner_id: user.id,
					avatar_64: await toBase64('https://api.lorem.space/image?w=256&h=256'),
					password: null,
					admins_ids: [user.id],
					muted_ids: [],
					banned_ids: [],
					type: type,
					users_ids: [...randomElements(usersIds, randomNumber(1, 20)), user.id]
				}
				break;

			case ChatStatus.PRIVATE:
				newChat = {
					name: `${ChatStatus[type]}_${randomWord(randomNumber(3, 32))}`,
					owner_id: user.id,
					avatar_64: await toBase64('https://api.lorem.space/image?w=256&h=256'),
					password: 'bob',
					admins_ids: [user.id],
					muted_ids: [],
					banned_ids: [],
					type: type,
					users_ids: [...randomElements(usersIds, randomNumber(1, 20)), user.id]
				}
				break;
			case ChatStatus.PROTECTED:
				newChat = {
					name: `${ChatStatus[type]}_${randomWord(randomNumber(3, 32))}`,
					owner_id: user.id,
					avatar_64: await toBase64('https://api.lorem.space/image?w=256&h=256'),
					password: 'bob',
					admins_ids: [user.id],
					muted_ids: [],
					banned_ids: [],
					type: type,
					users_ids: [...randomElements(usersIds, randomNumber(1, 20)), user.id]
				}
				break;
			case ChatStatus.DISCUSSION:
				if (usersIds.length === 0)
					return null;
				newChat = {
					type: type,
					users_ids: [randomElement(usersIds), user.id]
				}
				break;
			default:
				throw new NotAcceptableException(`Unknown chat type ${type}.`)
		}

		let chat: Chat;
		try {
			chat = await this.chatService.addChatToDB(newChat);
		} catch (err) {
			if (err instanceof NotAcceptableException)
				return null;
			throw err;
		}
		this.sendFakeMsg(newChat);
		return newChat;
	}

	private async sendFakeMsg(chat: Chat) {
		if (chat.id == null || chat.id <= 0)
			throw new NotAcceptableException(`Chat id ${chat.id} is not acceptable.`);

		const msgs: Message[] = new Array();
		for (let userId of chat.users_ids) {
			const msg: Message = new Message();
			msg.id_sender = userId;
			msg.id_channel =  chat.id;
			msg.message = 'Hello world !';
			msgs.push(msg);
		}
		this.chatService.addMessages(msgs);
	}
}
