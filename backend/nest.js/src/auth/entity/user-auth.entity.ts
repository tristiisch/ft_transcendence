import { Exclude } from "class-transformer";
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class UserAuth extends BaseEntity {

    constructor(user_id: number) {
        super();
        this.user_id = user_id;
    }

	@PrimaryColumn()
	user_id?: number;

    @Column({ nullable: true })
	token_jwt?: string;

    @Exclude()
	@Column({ nullable: true })
  	twoFactorSecret?: string;

	has_2fa?: boolean = false;
}
