import { NotAcceptableException } from "@nestjs/common";
import { IsInt } from "class-validator";
import { User } from "src/users/entity/user.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MatchHistory {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	@IsInt()
	winner_id: number;

	@Column()
	@IsInt()
	loser_id: number;

	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	timestamp_started: Date;

	@Column({ type: 'timestamptz', nullable: true })
	timestamp_ended: Date;

	public isWinner(user : User): boolean {
		if (user.id !== this.loser_id && user.id !== this.winner_id)
			throw new NotAcceptableException(`User '${user.username}' is neither the winner nor the loser.`);
		return user.id === this.winner_id;
	}

	public isLooser(user : User): boolean {
		if (user.id !== this.loser_id && user.id !== this.winner_id)
			throw new NotAcceptableException(`User '${user.username}' is neither the winner nor the loser.`);
		return user.id === this.loser_id;
	}

	public isEnded(): boolean {
		return this.timestamp_ended !== null;
	}
}
