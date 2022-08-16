import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class UserAuth {

    constructor() {
        this.has_2fa = !this.twofa && this.twofa.length != 0;
    }

	@PrimaryColumn()
	user_id: number;

    @Column({ nullable: true })
	token: string;

    @Column({ nullable: true })
	twofa: string;

	has_2fa: boolean;
}