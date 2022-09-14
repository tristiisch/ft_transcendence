import { IsBoolean, IsInt, IsPositive } from "class-validator";

export class NotificationAction {

    @IsInt()
    @IsPositive()
    id: number;

    @IsBoolean()
    accept: boolean;
}