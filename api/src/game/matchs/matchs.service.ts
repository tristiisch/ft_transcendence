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
			ballPos: 0,
			p1Ready: false,
			p2Ready: false,
			p1Pos: 0,
			p2Pos: 0
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

	async startMatch(match: {stats: MatchStats, live_infos: MatchLiveInfos}) {
		const width = 3989
		const height = 2976
		const ball_size = width / 100
		var x = width/2
		var y = height/2
		var dx = 30
		var dy = 30

		const blocker_width = width / 50
		const blocker_height = height / 5
		//console.log("blocker height", blocker_height)
		const p1_xpos = width / 10
		const p2_xpos = width - width / 10


		// console.log(context.getImageData(x, y, 1, 1).data)
		//				let canvas = createCanvas(3989, 2976)
		//				canvas.width = 3989
		//				canvas.height = 2976
		//				var context = canvas.getContext('2d')
		//				loadImage("https://i.ibb.co/9ZrtvT4/stage.png").then((img) => {
		//					context.drawImage(img, 0, 0, 3989, 2976)
		//					}

		// let rgba = context.getImageData(x + dx, y, 1, 1).data
		// let rgba2 = context.getImageData(x, y + dy, 1, 1).data
		// if (y > 300 && y < 2700 && !(rgba[0] === 255 && rgba[1] === 255 && rgba[2] === 255 && rgba[2] === 255))
		// 	dx = -dx
		// if (x > 200 && x < 3800 && !(rgba2[0] === 255 && rgba2[1] === 255 && rgba2[2] === 255 && rgba2[2] === 255))
		// 	dy = -dy

		match.live_infos.room_socket.emit("startMatch")

		//maybe while(1) for more accuracy ?
		setTimeout(() => { let loop = setInterval(() => {
			if (x + dx < 0) {
				match.stats.score[1]++
				match.live_infos.room_socket.emit('p2Scored')
				dx = -dx
			}
			else if (x + dx > width) {
				match.stats.score[0]++
				match.live_infos.room_socket.emit('p1Scored')
				dx = -dx
			}
			if (match.stats.score[0] === 1 || match.stats.score[1] === 1) {
				match.live_infos.room_socket.emit("endMatch")
				this.save(match.stats)
				clearInterval(loop)
			}
			if (y + dy < 0 || y + dy > height) { dy = -dy }

			if ((x > p1_xpos && x < p1_xpos + blocker_width && x + dx > p1_xpos && x + dx < p1_xpos + blocker_width && y + dy > match.live_infos.p1Pos && y + dy < match.live_infos.p1Pos + blocker_height) ||
				(x > p2_xpos && x < p2_xpos + blocker_width && x + dx > p2_xpos && x + dx < p2_xpos + blocker_width && y + dy > match.live_infos.p2Pos && y + dy < match.live_infos.p2Pos + blocker_height))
					dy = -dy
			else if ((x + dx > p1_xpos && x + dx < p1_xpos + blocker_width && y + dy > match.live_infos.p1Pos && y + dy < match.live_infos.p1Pos + blocker_height) ||
					(x + dx > p2_xpos && x + dx < p2_xpos + blocker_width && y + dy > match.live_infos.p2Pos && y + dy < match.live_infos.p2Pos + blocker_height))
					dx = -dx
			x += dx
			y += dy
			match.live_infos.room_socket.emit("ball", x, y)
			//dx += dx < 0 ? -0.0001 : 0.0001
		}, 10)}, 3000)
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
