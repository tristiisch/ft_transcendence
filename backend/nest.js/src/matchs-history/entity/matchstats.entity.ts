import { IsInt } from "class-validator";
import { Column, Entity } from "typeorm";

@Entity()
export class MatchHistory {

    @Column()
    @IsInt()
    winner_id: number;

    @Column()
    @IsInt()
    looser_id: number;
}