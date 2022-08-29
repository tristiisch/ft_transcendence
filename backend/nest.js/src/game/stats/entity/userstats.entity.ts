import { IsInt, Min } from "class-validator";
import { User } from "src/users/entity/user.entity";
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class UserStats extends BaseEntity {

	constructor(userId: number) {
		super();
		this.user_id = userId;
		this.victories = 0;
		this.defeats = 0;
	}

	@PrimaryColumn()
	user_id: number;

	@Column({ default: 0 })
	@IsInt()
	@Min(0)
	victories: number;

	@Column({ default: 0 })
	@IsInt()
	@Min(0)
	defeats: number;

	@Column({ generatedType: 'STORED', asExpression: `victories - defeats`, update: false })
	score: number;

	rank: number;
}
