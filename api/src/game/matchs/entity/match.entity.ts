import { NotAcceptableException, UnprocessableEntityException } from "@nestjs/common";
import { IsInt } from "class-validator";
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

export enum MatchMakingTypes {
	NORMAL_MATCH,
	ANY_MATCH,
	OWN_MATCH
}

export interface Match extends MatchLiveInfos {}

@Entity()
export class Match extends BaseEntity {

	@PrimaryColumn({ default: "for api/test/" + Math.random().toString() })
	id: string

	@Column()
	@IsInt()
	user1_id: number;

	user1_username: string;
	user1_avatar: string;

	@Column()
	@IsInt()
	user2_id: number;

	user2_username: string;
	user2_avatar: string;

	@Column("int", { nullable: true, array: true })
	score: number[];

	@Column({ type: 'timestamptz', precision: null, default: () => 'CURRENT_TIMESTAMP' })
	timestamp_started: Date;

	@Column({ type: 'timestamptz', precision: null, nullable: true })
	timestamp_ended: Date;

	public getWinner?(): number {
		if (this.timestamp_ended === null)
			throw new UnprocessableEntityException('The game is not over, there is no winner yet.');

		const score_user1 = this.score[0];
		const score_user2 = this.score[1];

		if (score_user1 > score_user2)
			return this.user1_id;
		else if (score_user2 > score_user1)
			return this.user2_id;
		throw new UnprocessableEntityException(`There was no winner, the match ended in a tie (${this.score}).`);
	}

	public getLoser?(): number {
		if (this.timestamp_ended === null)
			throw new UnprocessableEntityException('The game is not over, there is no loser yet.');

		const score_user1 = this.score[0];
		const score_user2 = this.score[1];

		if (score_user1 < score_user2)
			return this.user1_id;
		else if (score_user2 < score_user1)
			return this.user2_id;
		throw new UnprocessableEntityException(`There was no loser, the match ended in a tie (${this.score}).`);
	}

	public getOpponent?(userId: number): number {
		if (userId === this.user1_id)
			return this.user2_id;
		else if (userId === this.user2_id)
			return this.user1_id;
		throw new UnprocessableEntityException(`${userId} didn't play in this match.`);
	}

	public isWinner?(userId: number): boolean {
		return this.getWinner() === userId;
	}

	public isEnded?(): boolean {
		return this.timestamp_ended !== null;
	}
}

export interface MatchLiveInfos extends CustomMatchInfos {
	room_socket: any,
	started: boolean,
	waiting: boolean,
	stopMatch: boolean,

	playersPosInterval: any,
	ballPosInterval: any,
	matchLoopInterval: any,

	T: Date,
	ballXPos: number,
	ballYPos: number,
	ballXDir: number,
	ballYDir: number,
	p1Ready: boolean,
	p2Ready: boolean,
	p1Pos: number,
	p2Pos: number
}

export interface CustomMatchInfos {
	ballSpeed?: number,
	racketSize?: number,
	increaseBallSpeed?: boolean,
	world?: number,
	winningScore?: number
}

export class GameInvitation {
	toUserId: number;
	matchInfo: CustomMatchInfos;
}

export class MatchOwn {

	opponent: string; // opponent_username
	score: number[];
	won?: boolean;
	date: Date;
	end: Date;
}
