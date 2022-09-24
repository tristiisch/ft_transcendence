import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'users/entity/user.entity';
import { UsersService } from 'users/users.service';
import { Brackets, IsNull, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { MatchStats } from './entity/matchstats.entity';
import { MatchOwn } from './entity/own-match.entity';
import MatchLiveInfos from './entity/matchliveinfos.entity';

@Injectable()
export class MatchStatsService {

	constructor(
		@InjectRepository(MatchStats)
		private matchsHistoryRepository: Repository<MatchStats>,
	) {}

	private matches = new Map<number, {stats: MatchStats, live_infos: MatchLiveInfos}>()
	private players_queue = new Array<User>()

	private readonly winningScore = 5
	private readonly stageWidth = 3989 / 1.5
	private readonly stageHeight = 2976 / 1.5
	private readonly blockerWidth = this.stageWidth / 50
	private readonly blockerHeight = this.stageHeight / 5
	private readonly p1XPos = this.stageWidth / 10
	private readonly p2XPpos = this.stageWidth - this.p1XPos

	@Inject(forwardRef(() => UsersService))
	private readonly userService: UsersService;

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

	public addPlayerToQueue(socket) {
		this.players_queue.push(socket)
	}

	async createNewMatch(p1, p2) {
		const match_stats = new MatchStats()
		match_stats.user1_id = p1.id
		match_stats.user2_id = p2.id
		match_stats.score = [0, 0]

		const res = await this.save(match_stats)
		const match_live_infos: MatchLiveInfos = {
			room_socket: undefined,
			started: false,
			waiting: true,
			stopMatch: false,
			ballXPos: this.stageWidth/2,
			ballYPos: this.stageHeight/2,
			p1Ready: false,
			p2Ready: false,
			p1Pos: this.stageHeight/2 - this.blockerHeight/2,
			p2Pos: this.stageHeight/2 - this.blockerHeight/2 
		}
		this.matches.set(res.id, {
			stats: res, 
			live_infos: match_live_infos
		})
		console.log(this.matches.get(res.id))
		return res.id
	}

	setWaitStatusToMatch(match_id) {
		this.matches.get(match_id).live_infos.waiting = true
	}

	findMatchFromUser(id) {
		this.matches.forEach((e) => {
			const user1_id = e.stats.user1_id
			const user2_id = e.stats.user2_id
			if (id === user1_id || id === user2_id)
				return e
		})
		return undefined
	}

	isUserPlayerFromMatch(user_id, match: MatchStats) {
		if (match.user1_id === user_id)
			return 1
		else if (match.user2_id === user_id)
			return 2
		return 0
	}

	async launchMatchLoop(match, dx, dy) {
		let interval = setInterval(() => {
			if (match.live_infos.stopMatch) {
				this.endMatch(match)
				clearInterval(interval)
			}
			if (match.live_infos.ballXPos + dx < 0) {
				match.stats.score[1]++
				match.live_infos.room_socket.emit('p2Scored')
				dx = -dx
			}
			else if (match.live_infos.ballXPos + dx > this.stageWidth) {
				match.stats.score[0]++
				match.live_infos.room_socket.emit('p1Scored')
				dx = -dx
			}
			if (match.stats.score[0] === this.winningScore || match.stats.score[1] === this.winningScore) {
				this.endMatch(match)
				clearInterval(interval)
			}
			if (match.live_infos.ballYPos + dy < 0 || match.live_infos.ballYPos + dy > this.stageHeight)
				dy = -dy

			if ((match.live_infos.ballXPos > this.p1XPos && match.live_infos.ballXPos < this.p1XPos + this.blockerWidth && match.live_infos.ballXPos + dx > this.p1XPos && match.live_infos.ballXPos + dx < this.p1XPos + this.blockerWidth && match.live_infos.ballYPos + dy > match.live_infos.p1Pos && match.live_infos.ballYPos + dy < match.live_infos.p1Pos + this.blockerHeight) ||
				(match.live_infos.ballXPos > this.p2XPpos && match.live_infos.ballXPos < this.p2XPpos + this.blockerWidth && match.live_infos.ballXPos + dx > this.p2XPpos && match.live_infos.ballXPos + dx < this.p2XPpos + this.blockerWidth && match.live_infos.ballYPos + dy > match.live_infos.p2Pos && match.live_infos.ballYPos + dy < match.live_infos.p2Pos + this.blockerHeight))
					dy = -dy
			else if ((match.live_infos.ballXPos + dx > this.p1XPos && match.live_infos.ballXPos + dx < this.p1XPos + this.blockerWidth && match.live_infos.ballYPos + dy > match.live_infos.p1Pos && match.live_infos.ballYPos + dy < match.live_infos.p1Pos + this.blockerHeight) ||
					(match.live_infos.ballXPos + dx > this.p2XPpos && match.live_infos.ballXPos + dx < this.p2XPpos + this.blockerWidth && match.live_infos.ballYPos + dy > match.live_infos.p2Pos && match.live_infos.ballYPos + dy < match.live_infos.p2Pos + this.blockerHeight))
					dx = -dx
			match.live_infos.ballXPos += dx
			match.live_infos.ballYPos += dy
		}, 1)
// 		if (match.live_infos.stopMatch) {
// 			this.endMatch(match)
// 			return
// 		}
// 		if (match.live_infos.ballXPos + dx < 0) {
// 			match.stats.score[1]++
// 			match.live_infos.room_socket.emit('p2Scored')
// 			dx = -dx
// 		}
// 		else if (match.live_infos.ballXPos + dx > this.stageWidth) {
// 			match.stats.score[0]++
// 			match.live_infos.room_socket.emit('p1Scored')
// 			dx = -dx
// 		}
// 		if (match.stats.score[0] === this.winningScore || match.stats.score[1] === this.winningScore) {
// 			this.endMatch(match)
// 			return
// 		}
// 		if (match.live_infos.ballYPos + dy < 0 || match.live_infos.ballYPos + dy > this.stageHeight)
// 			dy = -dy

// 		if ((match.live_infos.ballXPos > this.p1XPos && match.live_infos.ballXPos < this.p1XPos + this.blockerWidth && match.live_infos.ballXPos + dx > this.p1XPos && match.live_infos.ballXPos + dx < this.p1XPos + this.blockerWidth && match.live_infos.ballYPos + dy > match.live_infos.p1Pos && match.live_infos.ballYPos + dy < match.live_infos.p1Pos + this.blockerHeight) ||
// 			(match.live_infos.ballXPos > this.p2XPpos && match.live_infos.ballXPos < this.p2XPpos + this.blockerWidth && match.live_infos.ballXPos + dx > this.p2XPpos && match.live_infos.ballXPos + dx < this.p2XPpos + this.blockerWidth && match.live_infos.ballYPos + dy > match.live_infos.p2Pos && match.live_infos.ballYPos + dy < match.live_infos.p2Pos + this.blockerHeight))
// 				dy = -dy
// 		else if ((match.live_infos.ballXPos + dx > this.p1XPos && match.live_infos.ballXPos + dx < this.p1XPos + this.blockerWidth && match.live_infos.ballYPos + dy > match.live_infos.p1Pos && match.live_infos.ballYPos + dy < match.live_infos.p1Pos + this.blockerHeight) ||
// 				(match.live_infos.ballXPos + dx > this.p2XPpos && match.live_infos.ballXPos + dx < this.p2XPpos + this.blockerWidth && match.live_infos.ballYPos + dy > match.live_infos.p2Pos && match.live_infos.ballYPos + dy < match.live_infos.p2Pos + this.blockerHeight))
// 				dx = -dx
// 		match.live_infos.ballXPos += dx
// 		match.live_infos.ballYPos += dy
// // match.live_infos.room_socket.emit("ballPos", match.live_infos.ballXPos, match.live_infos.ballYPos)
// 		setTimeout(() => this.launchMatchLoop(match, dx, dy), 0)
	}

	async startMatch(match: {stats: MatchStats, live_infos: MatchLiveInfos}) {
		let dx = 3
		let dy = 3

		console.log("startMatch " + match.stats.id)
		match.live_infos.room_socket.emit("startMatch")

		setTimeout(() => this.launchMatchLoop(match, dx, dy), 3000)
		let emitPosInterval = setInterval(() => {
			if (match.live_infos.stopMatch)
				clearInterval(emitPosInterval)
			match.live_infos.room_socket.emit("ballPos", match.live_infos.ballXPos, match.live_infos.ballYPos)
		}, 30)
	}

	async endMatch(match: {stats: MatchStats, live_infos: MatchLiveInfos}) {
		match.live_infos.stopMatch = true
		match.live_infos.room_socket.emit("endMatch")
		match.stats.timestamp_ended = new Date
		this.save(match.stats)
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
		const sqlStatement: SelectQueryBuilder<MatchStats> = this.matchsHistoryRepository.createQueryBuilder('matchhistory')
			.where('matchhistory.timestamp_ended IS NULL')
			.andWhere('matchhistory.score IS NOT NULL')
			.addOrderBy('matchhistory.id', 'DESC', 'NULLS LAST');
		return await sqlStatement.getMany().then(async (matchsStats: MatchStats[]) => {
			for (let ms of matchsStats) {
				const user1: User = await this.userService.findOne(ms.user1_id);
				const user2: User = await this.userService.findOne(ms.user2_id);

				ms.user1_avatar = user1.getAvatarURL();
				ms.user1_username = user1.username;

				ms.user2_avatar = user2.getAvatarURL();
				ms.user2_username = user2.username;
			}
			return matchsStats;
		});
	}

	async save(match: MatchStats) {
		return this.matchsHistoryRepository.save(match)
	}
	async add(matchHistory: MatchStats) {
		return this.matchsHistoryRepository.save(matchHistory);
	}
}
