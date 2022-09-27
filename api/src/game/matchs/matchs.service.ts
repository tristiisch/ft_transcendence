import { BadRequestException, forwardRef, Inject, Injectable, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from 'users/entity/user.entity';
import { UsersService } from 'users/users.service';
import { Brackets, IsNull, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { Match, MatchStats, MatchLiveInfos, CustomMatchInfos, MatchMakingTypes, GameInvitation } from './entity/match.entity';
import { MatchOwn } from './entity/own-match.entity';
import { StatsService } from 'game/stats/stats.service';
import { Notification, NotificationType } from 'notification/entity/notification.entity';
import { SocketService } from 'socket/socket.service';
import { NotificationService } from 'notification/notification.service';
import { v4 as uuid } from "uuid"

@Injectable()
export class MatchStatsService {

	constructor(
		@InjectRepository(MatchStats)
		private matchsHistoryRepository: Repository<MatchStats>,
	) {}

	private matches = new Map<string, Match>()
	private players_queue = new Map<number, { user: User, match_type: MatchMakingTypes, custom_match_infos: CustomMatchInfos }>()

	private readonly stageWidth = 3989
	private readonly stageHeight = 2976
	private readonly blockerWidth = this.stageWidth / 50
	private readonly blockerHeight = this.stageHeight / 5
	private readonly p1XPos = this.stageWidth / 10
	private readonly p2XPos = this.stageWidth - this.p1XPos
	private readonly winningScore = -1
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
	public addPlayerToQueue(user_id, data) {
		this.players_queue.set(user_id, data)
	}
	public removePlayerFromQueue(user_id) {
		this.players_queue.delete(user_id)
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
		const stats = new MatchStats()
		stats.id = uuid()
		stats.user1_id = p1.id
		stats.user2_id = p2.id
		stats.score = [0, 0]
		const live: MatchLiveInfos = {
			room_socket: undefined,
			started: false,
			waiting: true,
			stopMatch: false,
			ballSpeed: this.ballSpeed,
			racketSize: this.blockerHeight,
			increaseBallSpeed: this.increaseBallSpeed,
			world: this.world,
			winningScore: this.winningScore,

			playersPosInterval: null,
			ballPosInterval: null,
			matchLoopInterval: null,

			T: null,
			ballXPos: this.stageWidth/2,
			ballYPos: this.stageHeight/2,
			ballXDir: 1,
			ballYDir: 1,
			p1Ready: false,
			p2Ready: false,
			p1Pos: this.stageHeight/2 - this.blockerHeight/2,
			p2Pos: this.stageHeight/2 - this.blockerHeight/2
		}
		this.matches.set(stats.id, { stats, live })
		return stats.id
	}

	isUserPlayerFromMatch(user_id, match: MatchStats) {
		if (match.user1_id === user_id)
			return 1
		else if (match.user2_id === user_id)
			return 2
		return 0
	}

	// async launchMatchLoop(match, match.live_infos.ballXDir, match.live_infos.ballYDir, ballPosInterval) {
	// 	let matchLoopInterval = setInterval(async () => {
	// 		if (match.live_infos.stopMatch)
	// 			await this.endMatch(match, ballPosInterval, matchLoopInterval, true)
	// 		if (match.live_infos.ballXPos + match.live_infos.ballXDir < 0) {
	// 			match.stats.score[1]++
	// 			match.live_infos.room_socket.emit('p2Scored')
		// 		match.live_infos.ballXDir = -match.live_infos.ballXDir
		// 	}
		// 	else if (match.live_infos.ballXPos + match.live_infos.ballXDir > this.stageWidth) {
		// 		match.stats.score[0]++
		// 		match.live_infos.room_socket.emit('p1Scored')
		// 		match.live_infos.ballXDir = -match.live_infos.ballXDir
		// 	}
		// 	if (match.stats.score[0] === this.winningScore || match.stats.score[1] === this.winningScore)
		// 		await this.endMatch(match, ballPosInterval, matchLoopInterval)
		// 	if (match.live_infos.ballYPos + match.live_infos.ballYDir < 0 || match.live_infos.ballYPos + match.live_infos.ballYDir > this.stageHeight)
		// 		match.live_infos.ballYDir = -match.live_infos.ballYDir

		// 	if ((match.live_infos.ballXPos > this.p1XPos && match.live_infos.ballXPos < this.p1XPos + this.blockerWidth && match.live_infos.ballXPos + match.live_infos.ballXDir > this.p1XPos && match.live_infos.ballXPos + match.live_infos.ballXDir < this.p1XPos + this.blockerWidth && match.live_infos.ballYPos + match.live_infos.ballYDir > match.live_infos.p1Pos && match.live_infos.ballYPos + match.live_infos.ballYDir < match.live_infos.p1Pos + this.blockerHeight) ||
		// 		(match.live_infos.ballXPos > this.p2XPos && match.live_infos.ballXPos < this.p2XPos + this.blockerWidth && match.live_infos.ballXPos + match.live_infos.ballXDir > this.p2XPos && match.live_infos.ballXPos + match.live_infos.ballXDir < this.p2XPos + this.blockerWidth && match.live_infos.ballYPos + match.live_infos.ballYDir > match.live_infos.p2Pos && match.live_infos.ballYPos + match.live_infos.ballYDir < match.live_infos.p2Pos + this.blockerHeight))
		// 			match.live_infos.ballYDir = -match.live_infos.ballYDir
		// 	else if ((match.live_infos.ballXPos + match.live_infos.ballXDir > this.p1XPos && match.live_infos.ballXPos + match.live_infos.ballXDir < this.p1XPos + this.blockerWidth && match.live_infos.ballYPos + match.live_infos.ballYDir > match.live_infos.p1Pos && match.live_infos.ballYPos + match.live_infos.ballYDir < match.live_infos.p1Pos + this.blockerHeight) ||
		// 			(match.live_infos.ballXPos + match.live_infos.ballXDir > this.p2XPos && match.live_infos.ballXPos + match.live_infos.ballXDir < this.p2XPos + this.blockerWidth && match.live_infos.ballYPos + match.live_infos.ballYDir > match.live_infos.p2Pos && match.live_infos.ballYPos + match.live_infos.ballYDir < match.live_infos.p2Pos + this.blockerHeight))
		// 			match.live_infos.ballXDir = -match.live_infos.ballXDir
		// 	match.live_infos.ballXPos += match.live_infos.ballXDir
		// 	match.live_infos.ballYPos += match.live_infos.ballYDir
		// }, 0)
// 		if (match.live_infos.stopMatch) {
// 			this.endMatch(match)
// 			return
// 		}
// 		if (match.live_infos.ballXPos + match.live_infos.ballXDir < 0) {
// 			match.stats.score[1]++
// 			match.live_infos.room_socket.emit('p2Scored')
// 			match.live_infos.ballXDir = -match.live_infos.ballXDir
// 		}
// 		else if (match.live_infos.ballXPos + match.live_infos.ballXDir > this.stageWidth) {
// 			match.stats.score[0]++
// 			match.live_infos.room_socket.emit('p1Scored')
// 			match.live_infos.ballXDir = -match.live_infos.ballXDir
// 		}
// 		if (match.stats.score[0] === this.winningScore || match.stats.score[1] === this.winningScore) {
// 			this.endMatch(match)
// 			return
// 		}
// 		if (match.live_infos.ballYPos + match.live_infos.ballYDir < 0 || match.live_infos.ballYPos + match.live_infos.ballYDir > this.stageHeight)
// 			match.live_infos.ballYDir = -match.live_infos.ballYDir

// 		if ((match.live_infos.ballXPos > this.p1XPos && match.live_infos.ballXPos < this.p1XPos + this.blockerWidth && match.live_infos.ballXPos + match.live_infos.ballXDir > this.p1XPos && match.live_infos.ballXPos + match.live_infos.ballXDir < this.p1XPos + this.blockerWidth && match.live_infos.ballYPos + match.live_infos.ballYDir > match.live_infos.p1Pos && match.live_infos.ballYPos + match.live_infos.ballYDir < match.live_infos.p1Pos + this.blockerHeight) ||
// 			(match.live_infos.ballXPos > this.p2XPpos && match.live_infos.ballXPos < this.p2XPpos + this.blockerWidth && match.live_infos.ballXPos + match.live_infos.ballXDir > this.p2XPpos && match.live_infos.ballXPos + match.live_infos.ballXDir < this.p2XPpos + this.blockerWidth && match.live_infos.ballYPos + match.live_infos.ballYDir > match.live_infos.p2Pos && match.live_infos.ballYPos + match.live_infos.ballYDir < match.live_infos.p2Pos + this.blockerHeight))
// 				match.live_infos.ballYDir = -match.live_infos.ballYDir
// 		else if ((match.live_infos.ballXPos + match.live_infos.ballXDir > this.p1XPos && match.live_infos.ballXPos + match.live_infos.ballXDir < this.p1XPos + this.blockerWidth && match.live_infos.ballYPos + match.live_infos.ballYDir > match.live_infos.p1Pos && match.live_infos.ballYPos + match.live_infos.ballYDir < match.live_infos.p1Pos + this.blockerHeight) ||
// 				(match.live_infos.ballXPos + match.live_infos.ballXDir > this.p2XPpos && match.live_infos.ballXPos + match.live_infos.ballXDir < this.p2XPpos + this.blockerWidth && match.live_infos.ballYPos + match.live_infos.ballYDir > match.live_infos.p2Pos && match.live_infos.ballYPos + match.live_infos.ballYDir < match.live_infos.p2Pos + this.blockerHeight))
// 				match.live_infos.ballXDir = -match.live_infos.ballXDir
// 		match.live_infos.ballXPos += match.live_infos.ballXDir
// 		match.live_infos.ballYPos += match.live_infos.ballYDir
// // match.live_infos.room_socket.emit("ballPos", match.live_infos.ballXPos, match.live_infos.ballYPos)
// 		setTimeout(() => this.launchMatchLoop(match, match.live_infos.ballXDir, match.live_infos.ballYDir), 0)
	// }

	async startMatch(match: Match) {
		this.setNewMatchRoundVar(match.live)

		let oldp1Pos = match.live.p1Pos
		let oldp2Pos = match.live.p2Pos
		match.live.playersPosInterval = setInterval(() => {
			if (match.live.p1Pos != oldp1Pos) {
				match.live.room_socket.emit('p1Pos', match.live.p1Pos)
				oldp1Pos = match.live.p1Pos
			}
			if (match.live.p2Pos != oldp2Pos) {
				match.live.room_socket.emit('p2Pos', match.live.p2Pos)
				oldp2Pos = match.live.p2Pos
			}
		}, 300)

		setTimeout(() => {
			match.stats.timestamp_started = new Date
			match.live.ballPosInterval = setInterval(() => {
				match.live.room_socket.emit('ballPos', match.live.ballXPos, match.live.ballYPos)
			}, 10)
			this.startMatchLoop(match)
		}, 3000)
	}
	setNewMatchRoundVar(match: MatchLiveInfos) {
		match.ballXPos = this.stageWidth / 2
		match.ballYPos = Math.random() * this.stageHeight
		match.ballXDir = (Math.round(Math.random() * 10)) % 2 ? this.ballSpeed : -this.ballSpeed
		match.ballYDir = (Math.round(Math.random() * 10)) % 2 ? this.ballSpeed : -this.ballSpeed
	}
	async startMatchLoop(match: Match) {
		match.live.T = new Date
		match.live.room_socket.emit("newMatchRound", {
			ballX: match.live.ballXPos,
			ballY: match.live.ballYPos,
			dx: match.live.ballXDir,
			dy: match.live.ballYDir,
			scored: undefined
		})
		// function update() {
		// 	match.live_infos.T = this.calcBallPos(match)

		// 	if ((match.live_infos.ballXPos > this.p1XPos && match.live_infos.ballXPos < this.p1XPos + this.blockerWidth && match.live_infos.ballXPos + match.live_infos.ballXDir > this.p1XPos && match.live_infos.ballXPos + match.live_infos.ballXDir < this.p1XPos + this.blockerWidth && match.live_infos.ballYPos + match.live_infos.ballYDir > match.live_infos.p1Pos && match.live_infos.ballYPos + match.live_infos.ballYDir < match.live_infos.p1Pos + this.blockerHeight) ||
		// 		(match.live_infos.ballXPos > this.p2XPos && match.live_infos.ballXPos < this.p2XPos + this.blockerWidth && match.live_infos.ballXPos + match.live_infos.ballXDir > this.p2XPos && match.live_infos.ballXPos + match.live_infos.ballXDir < this.p2XPos + this.blockerWidth && match.live_infos.ballYPos + match.live_infos.ballYDir > match.live_infos.p2Pos && match.live_infos.ballYPos + match.live_infos.ballYDir < match.live_infos.p2Pos + this.blockerHeight))
		// 			match.live_infos.ballYDir *= -1
		// 	else if ((match.live_infos.ballXPos + match.live_infos.ballXDir > this.p1XPos && match.live_infos.ballXPos + match.live_infos.ballXDir < this.p1XPos + this.blockerWidth && match.live_infos.ballYPos + match.live_infos.ballYDir > match.live_infos.p1Pos && match.live_infos.ballYPos + match.live_infos.ballYDir < match.live_infos.p1Pos + this.blockerHeight) ||
		// 			(match.live_infos.ballXPos + match.live_infos.ballXDir > this.p2XPos && match.live_infos.ballXPos + match.live_infos.ballXDir < this.p2XPos + this.blockerWidth && match.live_infos.ballYPos + match.live_infos.ballYDir > match.live_infos.p2Pos && match.live_infos.ballYPos + match.live_infos.ballYDir < match.live_infos.p2Pos + this.blockerHeight))
		// 			match.live_infos.ballXDir *= -1
		// 	setTimeout(update.bind(this), 0)
		// }
		// update.bind(this)()
		match.live.matchLoopInterval = setInterval(() => {
			match.live.T = this.calcBallPos(match)

			if ((match.live.ballXPos > this.p1XPos && match.live.ballXPos < this.p1XPos + this.blockerWidth && match.live.ballXPos + match.live.ballXDir > this.p1XPos && match.live.ballXPos + match.live.ballXDir < this.p1XPos + this.blockerWidth && match.live.ballYPos + match.live.ballYDir > match.live.p1Pos && match.live.ballYPos + match.live.ballYDir < match.live.p1Pos + this.blockerHeight) ||
				(match.live.ballXPos > this.p2XPos && match.live.ballXPos < this.p2XPos + this.blockerWidth && match.live.ballXPos + match.live.ballXDir > this.p2XPos && match.live.ballXPos + match.live.ballXDir < this.p2XPos + this.blockerWidth && match.live.ballYPos + match.live.ballYDir > match.live.p2Pos && match.live.ballYPos + match.live.ballYDir < match.live.p2Pos + this.blockerHeight))
					match.live.ballYDir *= -1
			else if ((match.live.ballXPos + match.live.ballXDir > this.p1XPos && match.live.ballXPos + match.live.ballXDir < this.p1XPos + this.blockerWidth && match.live.ballYPos + match.live.ballYDir > match.live.p1Pos && match.live.ballYPos + match.live.ballYDir < match.live.p1Pos + this.blockerHeight) ||
					(match.live.ballXPos + match.live.ballXDir > this.p2XPos && match.live.ballXPos + match.live.ballXDir < this.p2XPos + this.blockerWidth && match.live.ballYPos + match.live.ballYDir > match.live.p2Pos && match.live.ballYPos + match.live.ballYDir < match.live.p2Pos + this.blockerHeight))
					match.live.ballXDir *= -1
		})
	}
 	calcBallPos(match: Match) {
		let T2 = new Date
		let tdiff = T2.getTime() - match.live.T.getTime()
		var x2 = match.live.ballXPos + (tdiff * match.live.ballXDir)
		if (x2 < 0 || x2 >= this.stageWidth) {
			if (x2 < 0) match.stats.score[1]++
			else match.stats.score[0]++
			if (match.stats.score[0] === match.live.winningScore || match.stats.score[1] === match.live.winningScore) {
				this.endMatch(match)
				return
			}
			this.setNewMatchRoundVar(match.live)
			match.live.room_socket.emit('newMatchRound', {
				dx: match.live.ballXDir,
				dy: match.live.ballYDir,
				scored: x2 < 0 ? 'p2' : 'p1'
			})
			return new Date
		}
		var y2 = match.live.ballYPos + (tdiff * match.live.ballYDir)
		if (y2 < 0 || y2 >= this.stageHeight) {
			if ((y2 / this.stageHeight) % 2) match.live.ballYDir *= -1
			y2 = this.stageHeight - (this.mod(y2, this.stageHeight))
		}
		match.live.ballXPos = x2
		match.live.ballYPos = y2
		return T2
	}
	mod(n, m) { // modulo funtion because JS : https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm
		return ((n % m) + m) % m;
	}

	async endMatch(match: Match, forceEnd?: boolean) {
		clearInterval(match.live.matchLoopInterval)
		clearInterval(match.live.ballPosInterval)
		clearInterval(match.live.playersPosInterval)
		match.live.room_socket.emit("endMatch")
		match.stats.timestamp_ended = new Date

		if (forceEnd != true) {
			await this.save(match.stats);
			await this.matchStatsService.addDefeat(match.stats.getLoser());
			await this.matchStatsService.addVictory(match.stats.getWinner());
		}

		this.matches.delete(match.stats.id)
	}

	async findHistory(userId: number) : Promise<MatchOwn[]> {
		const sqlStatement: SelectQueryBuilder<MatchStats> = this.matchsHistoryRepository.createQueryBuilder('matchhistory')
			.where('matchhistory.timestamp_ended is NOT NULL')
			.andWhere(new Brackets(web => {
				web.where('matchhistory.user1_id = :id', { id: userId }),
				web.orWhere('matchhistory.user2_id = :id')
			}))
			.addOrderBy('matchhistory.id', 'DESC', 'NULLS LAST');
		try {
			return await sqlStatement.getMany().then(async (matchs: MatchStats[]) => {
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

	async findOnlineMatchs() : Promise<MatchStats[]> {
		let matches = new Array<MatchStats>
		for (const [key, value]  of this.matches.entries()) {
			let id = matches.push(value.stats) - 1
			const user1: User = await this.userService.findOne(matches[id].user1_id);
			const user2: User = await this.userService.findOne(matches[id].user2_id);

			matches[id].user1_avatar = user1.getAvatarURL();
			matches[id].user1_username = user1.username;

			matches[id].user2_avatar = user2.getAvatarURL();
			matches[id].user2_username = user2.username;
		}
		return matches
	}

	async save(match: MatchStats) {
		return this.matchsHistoryRepository.save(match)
	}

	async add(matchHistory: MatchStats) {
		return this.matchsHistoryRepository.save(matchHistory);
	}

	private readonly requests: Map<number, GameInvitation> = new Map();

	getRequest(idInvite: number, idTarget: number): [number, GameInvitation] | null {
		const v = [...this.requests].find(([key, val]) => val.toUserId === idTarget && key === idInvite);
		if (v.length > 0)
			return v;
		return null;
	}

	async addRequest(user: User, id: any, matchInfo: CustomMatchInfos) {
		const target: User = await this.userService.findOne(id);
		
		if (this.requests.has(target.id))
			throw new BadRequestException(`You have already invited someone.`);

		let notif: Notification = new Notification();
		notif.user_id = target.id;
		notif.from_user_id = user.id;
		notif.type = NotificationType.MATCH_REQUEST;
		notif = await this.notifService.addNotif(notif);
		this.socketService.AddNotification(target, await notif.toFront(this.userService, [user, target]));

		const gameInvit = new GameInvitation();
		gameInvit.matchInfo = matchInfo;
		gameInvit.toUserId = target.id;

		this.requests.set(user.id, gameInvit);
	}

	/*async createInvitation(user: User, data: any) { // TODO change any to a type
		const invited_user = await this.userService.findOneByUsername(data.invited_user)
		if (invited_user && invited_user.status !== UserStatus.OFFLINE)
			this.addInviteToQueue(user, invited_user, data.custom_match_infos) // TODO remove
		// send match notification here
	}*/

	async acceptInvitation(invitedUser: User, inviteUser: User) {
		const req: [number, GameInvitation] = this.getRequest(inviteUser.id, invitedUser.id);
		if (!req) {
			throw new PreconditionFailedException(`You didn't have a invitation from user ${inviteUser.username} for game.`)
		}

		const custonGameInfo: CustomMatchInfos = req[1].matchInfo as CustomMatchInfos;

		if (inviteUser.status === UserStatus.ONLINE) {
			let match_id = await this.createNewMatch(inviteUser, invitedUser, custonGameInfo)
			this.matches.get(match_id).live.room_socket = this.socketService.server.to('match_' + match_id)
			this.socketService.getSocketToEmit(inviteUser.id).emit('foundMatch', match_id)
			return { id: match_id };
		} else {
			throw new PreconditionFailedException(`User ${inviteUser.username} is not connected.`)
		}
	}
}
