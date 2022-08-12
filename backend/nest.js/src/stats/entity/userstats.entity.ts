import { IsInt, Min } from "class-validator";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class UserStats {

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
}
