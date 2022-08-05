import { IsInt, Min } from "class-validator";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class UserStats {

	@PrimaryColumn()
	user_id: number;

	@Column({ default: 0 })
	@IsInt()
	@Min(0)
	wins: number;

	@Column({ default: 0 })
	@IsInt()
	@Min(0)
	losses: number;

	@Column({ generatedType: 'STORED', asExpression: `wins - losses`, update: false })
	score: number;
}
