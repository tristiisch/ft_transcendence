import { UserStatus } from "src/users/entity/user.entity";

export class LeaderboardUser {

    id: number;
    username: string
    rank: number;
    avatar: string;
    status: UserStatus;
}
