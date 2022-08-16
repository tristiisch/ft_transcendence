import { NotAcceptableException, UnprocessableEntityException } from "@nestjs/common";
import { IsInt } from "class-validator";
import { User } from "src/users/entity/user.entity";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MatchStats extends BaseEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	@IsInt()
	user_id1: number;

	@Column()
	@IsInt()
	user_id2: number;

	@Column("int", { nullable: true, array: true })
	score: number[];

	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	timestamp_started: Date;

	@Column({ type: 'timestamptz', nullable: true })
	timestamp_ended: Date;

	public getWinner(): number {
		const score_user1 = this.score[0];
		const score_user2 = this.score[1];
		
		if (score_user1 > score_user2)
			return this.user_id1;
		else if (score_user2 > score_user1)
			return this.user_id2;
		throw new UnprocessableEntityException('There was no winner, the match ended in a tie.');
	}

	public getLooser(): number {
		const score_user1 = this.score[0];
		const score_user2 = this.score[1];
		
		if (score_user1 < score_user2)
			return this.user_id1;
		else if (score_user2 < score_user1)
			return this.user_id2;
		throw new UnprocessableEntityException('They is no looser, the match finish by an equality.');
	}

	public getOpponent(userId: number): number {
		if (userId === this.user_id1)
			return this.user_id2;
		else if (userId === this.user_id2)
			return this.user_id1;
		throw new UnprocessableEntityException(`${userId} didn't play in this match.`);
	}

	public isWinner(userId: number): boolean {
		return this.getWinner() === userId;
	}

	public isEnded(): boolean {
		return this.timestamp_ended !== null;
	}
}
