import { BadRequestException, forwardRef, Inject, Injectable, NotAcceptableException, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from 'users/entity/user.entity';
import { UsersService } from 'users/users.service';
import { Brackets, IsNull, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { Match, MatchOwn, CustomMatchInfos, MatchMakingTypes, GameInvitation } from './entity/match.entity';
import { StatsService } from 'game/stats/stats.service';
import { Notification, NotificationFront, NotificationType } from 'notification/entity/notification.entity';
import { SocketService } from 'socket/socket.service';
import { NotificationService } from 'notification/notification.service';
import { v4 as uuid } from "uuid"
import { ChatService } from 'chat/chat.service';
import { Message } from 'chat/entity/message.entity';

@Injectable()
export class MatchService {

	constructor(
		@InjectRepository(Match)
		private matchsHistoryRepository: Repository<Match>,
	) {}

	private matches = new Map<string, Match>()
	private players_queue = new Map<number, { user: User, match_type: MatchMakingTypes, custom_match_infos: CustomMatchInfos }>()

	private readonly stageWidth = 3989
	private readonly stageHeight = 2976
	private readonly blockerWidth = this.stageWidth / 50
	private readonly blockerHeight = this.stageHeight / 5
	private readonly p1XPos = this.stageWidth / 10
	private readonly p2XPos = this.stageWidth - this.p1XPos
	private readonly winningScore = 5
	private readonly ballSpeed = 2
	private readonly increaseBallSpeed = false
	private readonly world = 0

	@Inject(forwardRef(() => UsersService))
	private readonly userService: UsersService;
	@Inject(forwardRef(() => StatsService))
	private readonly matchStatsService: StatsService;
	@Inject(forwardRef(() => NotificationService))
	private readonly notifService: NotificationService;
	@Inject(forwardRef(() => SocketService))
	private readonly socketService: SocketService;
	@Inject(forwardRef(() => ChatService))
	private readonly chatService: ChatService;

	public getRepo() {
		return this.matchsHistoryRepository;
	}
	public getMatches() {
		return this.matches;
	}
	public getPlayersQueue() {
		return this.players_queue
	}
	public getStageWidth() {
		return this.stageWidth
	}
	public addPlayerToQueue(user_id: number, data: { user: User, match_type: MatchMakingTypes, custom_match_infos: CustomMatchInfos }) {
		this.players_queue.set(user_id, data)
	}
	public removePlayerFromQueue(user_id: number) {
		this.players_queue.delete(user_id)
	}
	public getMatch(user_id: number): Match | undefined {
		return [...this.matches.values()].find((match) => match.user1_id === user_id || match.user2_id === user_id)
	}

	public findUserToPlay(match_type: MatchMakingTypes) {
		console.log("match_type:", match_type)
		for (const [key, value] of this.players_queue.entries()) {
			if ((match_type === MatchMakingTypes.NORMAL_MATCH && value.match_type !== MatchMakingTypes.OWN_MATCH) ||
				(match_type === MatchMakingTypes.ANY_MATCH) ||
				(match_type === MatchMakingTypes.OWN_MATCH && value.match_type === MatchMakingTypes.ANY_MATCH))
					return value
		}
		return null
	}

	async createNewMatch(p1: User, p2: User, custom: CustomMatchInfos) {
		const match = new Match()
		match.id = uuid()
		match.user1_id = p1.id
		match.user2_id = p2.id
		match.user1_avatar = p1.getAvatarURL();
		match.user1_username = p1.username;
		match.user2_avatar = p2.getAvatarURL();
		match.user2_username = p2.username;
		match.score = [0, 0]
		match.started = false
		match.waiting = true
		match.stopMatch = false
		
		if (custom) { // check custom infos
			console.log("custom!", custom)
			match.ballSpeed = this.ballSpeed * (custom.ballSpeed / 100)
			match.racketSize = this.blockerHeight * (custom.racketSize / 100)
			match.increaseBallSpeed = custom.increaseBallSpeed
			match.world = custom.world
			match.winningScore = custom.winningScore
		}
		else {
			console.log("not custom!")
			match.ballSpeed = this.ballSpeed
			match.racketSize = this.blockerHeight
			match.increaseBallSpeed = this.increaseBallSpeed
			match.world = this.world
			match.winningScore = this.winningScore
		}

		match.ballXPos = this.stageWidth/2
		match.ballYPos = this.stageHeight/2
		match.ballXDir = 1,
		match.ballYDir = 1,
		match.p1Ready = false
		match.p2Ready = false
		match.p1Pos = this.stageHeight/2 - this.blockerHeight/2
		match.p2Pos = this.stageHeight/2 - this.blockerHeight/2
		this.matches.set(match.id, match)
		return match.id
	}

	isUserPlayerFromMatch(user_id, match: Match) {
		if (match.user1_id === user_id)
			return 1
		else if (match.user2_id === user_id)
			return 2
		return 0
	}

	async startMatch(match: Match) {
		this.setNewMatchRoundVar(match)

		let oldp1Pos = match.p1Pos
		let oldp2Pos = match.p2Pos

		match.timestamp_started = new Date
		match.room_socket.emit("startMatch")

		setTimeout(() => {
			if (!match.stopMatch) {
				match.playersPosInterval = setInterval(() => {
					if (match.p1Pos != oldp1Pos) {
						match.room_socket.emit('p1Pos', match.p1Pos)
						oldp1Pos = match.p1Pos
					}
					if (match.p2Pos != oldp2Pos) {
						match.room_socket.emit('p2Pos', match.p2Pos)
						oldp2Pos = match.p2Pos
					}
				}, 1)
			}

			if (!match.stopMatch) {
				match.ballPosInterval = setInterval(() => {
					match.room_socket.emit('ballPos', match.ballXPos, match.ballYPos)
				}, 1)
			}
			this.startMatchLoop(match)
		}, 6000)
	}
	setNewMatchRoundVar(match: Match) {
		match.ballXPos = this.stageWidth / 2
		match.ballYPos = this.stageHeight / 2//Math.random() * this.stageHeight
		if (match.increaseBallSpeed && match.ballSpeed <= 5)
			match.ballSpeed += 0.2
		match.ballXDir = (Math.round(Math.random() * 10)) % 2 ? match.ballSpeed : -match.ballSpeed
		match.ballYDir = (Math.round(Math.random() * 10)) % 2 ? match.ballSpeed : -match.ballSpeed
	}
	async startMatchLoop(match: Match) {
		match.T = new Date
		match.room_socket.emit("newMatchRound", {
			ballX: match.ballXPos,
			ballY: match.ballYPos,
			dx: match.ballXDir,
			dy: match.ballYDir,
			scored: undefined
		})
		// function update() {
		// 	match.T = this.calcBallPos(match)

		// 	setTimeout(update.bind(this), 0)
		// }
		// update.bind(this)()
		if (!match.stopMatch) {
			match.matchLoopInterval = setInterval(() => {
				match.T = this.calcBallPos(match)
				// console.log(match.ballXPos, match.ballYPos)
				// if ((match.ballXPos >= this.p1XPos && match.ballXPos < this.p1XPos + this.blockerWidth && match.ballXPos + match.ballXDir >= this.p1XPos && match.ballXPos + match.ballXDir < this.p1XPos + this.blockerWidth && match.ballYPos + match.ballYDir >= match.p1Pos && match.ballYPos + match.ballYDir < match.p1Pos + this.blockerHeight) ||
				// 	(match.ballXPos >= this.p2XPos && match.ballXPos < this.p2XPos + this.blockerWidth && match.ballXPos + match.ballXDir >= this.p2XPos && match.ballXPos + match.ballXDir < this.p2XPos + this.blockerWidth && match.ballYPos + match.ballYDir >= match.p2Pos && match.ballYPos + match.ballYDir < match.p2Pos + this.blockerHeight))
				// 		match.ballYDir *= -1
				// else if ((match.ballXPos + match.ballXDir >= this.p1XPos && match.ballXPos + match.ballXDir < this.p1XPos + this.blockerWidth && match.ballYPos + match.ballYDir >= match.p1Pos && match.ballYPos + match.ballYDir < match.p1Pos + this.blockerHeight) ||
				// 		(match.ballXPos + match.ballXDir >= this.p2XPos && match.ballXPos + match.ballXDir < this.p2XPos + this.blockerWidth && match.ballYPos + match.ballYDir >= match.p2Pos && match.ballYPos + match.ballYDir < match.p2Pos + this.blockerHeight))
				// 		match.ballXDir *= -1
			}, 0)
		}
	}
 	calcBallPos(match: Match) {
		let T2 = new Date
		let tdiff = T2.getTime() - match.T.getTime()

		var x2 = match.ballXPos + (tdiff * match.ballXDir)
		if (x2 < -(500 * match.ballSpeed) || x2 >= this.stageWidth + (500 * match.ballSpeed)) {
		// if (x2 < 0 || x2 >= this.stageWidth) {
			if (x2 < 0) match.score[1]++
			else match.score[0]++
			if (match.score[0] === match.winningScore || match.score[1] === match.winningScore) {
				this.endMatch(match) // TODO add await
				return
			}
			this.setNewMatchRoundVar(match)
			match.room_socket.emit('newMatchRound', {
				dx: match.ballXDir,
				dy: match.ballYDir,
				scored: x2 < 0 ? 'p2' : 'p1'
			})
			return new Date
		}

		var y2 = match.ballYPos + (tdiff * match.ballYDir)
		if (y2 < 0 || y2 >= this.stageHeight) {
			if ((y2 / this.stageHeight) % 2) match.ballYDir *= -1
			y2 = this.stageHeight - (this.mod(y2, this.stageHeight))
		}

		// if ((x2 >= this.p1XPos && x2 < this.p1XPos + this.blockerWidth && x2 + match.ballXDir >= this.p1XPos && x2 + match.ballXDir < this.p1XPos + this.blockerWidth && y2 + match.ballYDir >= match.p1Pos && y2 + match.ballYDir < match.p1Pos + this.blockerHeight) ||
		// 	(x2 >= this.p2XPos && x2 < this.p2XPos + this.blockerWidth && x2 + match.ballXDir >= this.p2XPos && x2 + match.ballXDir < this.p2XPos + this.blockerWidth && y2 + match.ballYDir >= match.p2Pos && y2 + match.ballYDir < match.p2Pos + this.blockerHeight)) {
		// 		console.log("Y hit !")
		// 		match.ballYDir *= -1
		// 		y2 = y2 + 2 * match.ballYDir
		// 	}
		if ((x2 + match.ballXDir >= this.p1XPos && x2 + match.ballXDir < this.p1XPos + this.blockerWidth && y2 + match.ballYDir >= match.p1Pos && y2 + match.ballYDir < match.p1Pos + match.racketSize) ||
				(x2 + match.ballXDir >= this.p2XPos && x2 + match.ballXDir < this.p2XPos + this.blockerWidth && y2 + match.ballYDir >= match.p2Pos && y2 + match.ballYDir < match.p2Pos + match.racketSize))
					match.ballXDir *= -1

		match.ballXPos = x2
		match.ballYPos = y2

		return T2
	}
	mod(n, m) { // modulo funtion because JS : https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm
		return ((n % m) + m) % m;
	}

	async endMatch(match: Match, forfeitUserId?: number) {
		clearInterval(match.matchLoopInterval)
		clearInterval(match.ballPosInterval)
		clearInterval(match.playersPosInterval)

		match.timestamp_ended = new Date

		if (match.user1_id === forfeitUserId){
			match.score[0] = -1
			match.room_socket.emit("endMatch", "Yay! " + match.user2_username + " won the match by forfeit against " + match.user1_username + "!")
		}
		else if (match.user2_id === forfeitUserId) {
			match.score[1] = -1
			match.room_socket.emit("endMatch", "Yay! " + match.user1_username + " won the match by forfeit against " + match.user2_username + "!")
		}
		else {
			if (match.score[0] > match.score[1])
				match.room_socket.emit("endMatch", "Yay! " + match.user1_username + " won the match against " + match.user2_username + "!")
			else
				match.room_socket.emit("endMatch", "Yay! " + match.user2_username + " won the match against " + match.user1_username + "!")
		}

		match.room_socket.socketsLeave("match_" + match.id)

		await this.save(match);
		await this.matchStatsService.addDefeat(match.getLoser());
		await this.matchStatsService.addVictory(match.getWinner());

		this.matches.delete(match.id)
	}

	removeUserFromMatch(user_id: number) {
		this.matches.forEach((match) => {
			if (match.started) {
				if (user_id === match.user1_id) {
					match.p1Ready = false
					setTimeout(() => {
						console.log("p1Ready:", match.p1Ready)
						if (!match.p1Ready) this.endMatch(match, user_id)
					}, 5000)
				}
				else if (user_id === match.user2_id) {
					match.p2Ready = false
					setTimeout(() => {
						console.log("p2Ready:", match.p2Ready)
						if (!match.p2Ready) this.endMatch(match, user_id)
					}, 5000)
				}
			}
		})
	}

	async findHistory(userId: number) : Promise<MatchOwn[]> {
		const sqlStatement: SelectQueryBuilder<Match> = this.matchsHistoryRepository.createQueryBuilder('matchhistory')
			.where('matchhistory.timestamp_ended is NOT NULL')
			.andWhere(new Brackets(web => {
				web.where('matchhistory.user1_id = :id', { id: userId }),
				web.orWhere('matchhistory.user2_id = :id')
			}))
			.addOrderBy('matchhistory.timestamp_ended', 'DESC', 'NULLS LAST');
		try {
			return await sqlStatement.getMany().then(async (matchs: Match[]) => {
				const matchsFormatted: MatchOwn[] = new Array();
				const userCached: User[] = new Array();
				for (let m of matchs) {
					let matchFormatted: MatchOwn = new MatchOwn();
					let opponentId = m.getOpponent(userId);
					matchFormatted.date = m.timestamp_started;
					matchFormatted.end = m.timestamp_ended;
					matchFormatted.score = m.score;
					matchFormatted.opponent = (await this.userService.findOneWithCache(opponentId, userCached)).username;
					matchFormatted.won = m.isWinner(userId);
					if (m.user1_id !== userId) {
						let tmp = matchFormatted.score[0];
						matchFormatted.score[0] = matchFormatted.score[1];
						matchFormatted.score[1] = tmp;
					}
					matchsFormatted.push(matchFormatted);
				}
				return matchsFormatted;
			});
		} catch (err) {
			this.userService.lambdaDatabaseUnvailable(err);
		}
	}

	async findOnlineMatchs() : Promise<Match[]> {
		let matches = new Array()
		for (const [key, value]  of this.matches.entries())
			matches.push({
				id: value.id,
				user1_id: value.user1_id,
				user2_id: value.user2_id,
				user1_username: value.user1_username,
				user2_username: value.user2_username,
				user1_avatar: value.user1_avatar,
				user2_avatar: value.user2_avatar,
				score: value.score
			})
		return matches
	}

	async save(match: Match) {
		return this.matchsHistoryRepository.save(match)
	}

	async add(matchHistory: Match) {
		return this.matchsHistoryRepository.save(matchHistory);
	}

	private readonly requests: Map<number, GameInvitation> = new Map();

	getRequest(inviteUser: number, invitedUser: number): [number, GameInvitation] | null {
		const v = [...this.requests].find(([key, val]) => val.toUserId === invitedUser && key === inviteUser);
		if (v && v.length > 0)
			return v;
		return null;
	}

	async addRequest(user: User, id: any, matchInfo: CustomMatchInfos | null) {
		const target: User = await this.userService.findOne(id);
		
		if (this.requests.has(user.id))
			throw new NotAcceptableException(`You have already invited someone.`);
		if (user.isBlockedUser(target.id))
			throw new NotAcceptableException(`You have blocked ${target.username}. You can't invite him.`);
		if (target.isBlockedUser(user.id))
			throw new NotAcceptableException(`You are blocked by ${target.username}. You can't invite him.`);

		let notif: Notification = new Notification();
		notif.user_id = target.id;
		notif.from_user_id = user.id;
		notif.type = NotificationType.MATCH_REQUEST;
		notif = await this.notifService.addNotif(notif);
		this.socketService.AddNotification(target, await notif.toFront(this.userService, [user, target]));

		const gameInvit = new GameInvitation();
		if (matchInfo)
			gameInvit.matchInfo = matchInfo;
		gameInvit.toUserId = target.id;

		this.requests.set(user.id, gameInvit);
	}

	async acceptInvitation(invitedUser: User, inviteUser: User) {
		const req: [number, GameInvitation] = this.getRequest(inviteUser.id, invitedUser.id);
		if (!req) {
			throw new NotAcceptableException(`You didn't have a invitation of ${inviteUser.username} for playing pong.`)
		}

		if (this.getMatch(inviteUser.id) !== undefined) {
			throw new NotAcceptableException(`${inviteUser.username} is already in a match.`)
		}

		const custonGameInfo: CustomMatchInfos = req[1].matchInfo as CustomMatchInfos;

		if (inviteUser.status === UserStatus.ONLINE) {
			let match_id = await this.createNewMatch(inviteUser, invitedUser, custonGameInfo)
			this.matches.get(match_id).room_socket = this.socketService.server.to('match_' + match_id)
			this.socketService.getSocketToEmit(inviteUser.id).emit('foundMatch', match_id)

			let notif: Notification = new Notification();
			notif.user_id = inviteUser.id;
			notif.from_user_id = invitedUser.id;
			notif.type = NotificationType.MATCH_ACCEPT;
			notif.date = new Date();
	
			const notifFront: NotificationFront = await notif.toFront(this.userService, [invitedUser, inviteUser]);
			notifFront.match_uuid = match_id;

			this.socketService.AddNotification(inviteUser, notifFront);
			this.requests.delete(inviteUser.id);

			await this.chatService.disableButtonMessages(inviteUser, invitedUser);

			return { id: match_id };
		} else {
			throw new PreconditionFailedException(`User ${inviteUser.username} is not connected.`)
		}
	}

	async declineInvitation(invitedUser: User, inviteUser: User) {
		const req: [number, GameInvitation] = this.getRequest(inviteUser.id, invitedUser.id);
		if (!req) {
			throw new NotAcceptableException(`You didn't have a invitation of ${inviteUser.username} for playing pong.`)
		}

		let notif: Notification = new Notification();
		notif.user_id = inviteUser.id;
		notif.from_user_id = invitedUser.id;
		notif.type = NotificationType.MATCH_DECLINE;
		notif = await this.notifService.addNotif(notif);
		this.socketService.AddNotification(inviteUser, await notif.toFront(this.userService, [invitedUser, inviteUser]));

		this.requests.delete(inviteUser.id);
		await this.chatService.disableButtonMessages(inviteUser, invitedUser);
	}

	async removeOwnGameInvitation(inviteUser: User) {
		const gameInvit: GameInvitation = this.requests.get(inviteUser.id);
		if (!gameInvit) {
			throw new NotAcceptableException(`You didn't have a invitation.`)
		}
		const invitedUser: User = await this.userService.findOne(gameInvit.toUserId);

		let notif: Notification = new Notification();
		notif.user_id = invitedUser.id;
		notif.from_user_id = inviteUser.id;
		notif.type = NotificationType.MATCH_CANCEL;
		notif.date = new Date();

		const notifFront: NotificationFront = await notif.toFront(this.userService, [invitedUser, inviteUser]);
		this.socketService.AddNotification(invitedUser, notifFront);
	
		await this.notifService.removeNotifMatchRequest(inviteUser, invitedUser);
		this.requests.delete(inviteUser.id);
		await this.chatService.disableButtonMessages(inviteUser, invitedUser);
	}

	getOwnRequest(user: User) : GameInvitation {
		return this.requests.get(user.id);
	}
}
