import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class UserAuth extends BaseEntity {

    constructor(user_id: number) {
        super();
        this.has_2fa = this.twofa != null && this.twofa.length != 0;
        this.user_id = user_id;
    }

	@PrimaryColumn()
	user_id: number;

    @Column({ nullable: true })
	token: string;

    @Column({ nullable: true })
	twofa?: string;

	has_2fa?: boolean;
	isRegistered?: boolean;
	isAuthenticated?: boolean;
}