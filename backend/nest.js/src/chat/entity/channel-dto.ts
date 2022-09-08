import { IsInt, IsNotEmpty, IsOptional, IsString, IsNumber, IsPositive } from "class-validator";
import { ChatStatus } from "./chat.entity";

export class ChannelSelectDTO {

    @IsInt()
    @IsPositive()
    id: number;

    @IsInt()
    type: ChatStatus;
}

export class ChannelFetchDTO {

    @IsInt()
    @IsPositive()
    id: number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    password: string;

    @IsInt()
    type: ChatStatus;
}

export class ChannelCreateDTO {

    //@IsOptional()
    @IsString()
    @IsNotEmpty()
    name: string;
    
    //@IsOptional()
    @IsString()
    @IsNotEmpty()
	avatar_64: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    password: string;

    @IsInt()
    type: ChatStatus;

    @IsNumber({},{each: true})
	users_ids: number[];
}

export class ChannelEditDTO {

    @IsInt()
    @IsPositive()
    id: number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name: string;
    
    @IsOptional()
    @IsString()
    @IsNotEmpty()
	avatar_64: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class ChannelEditUsersDTO {

    @IsInt()
    @IsPositive()
    id: number;

    @IsNumber({},{each: true})
	users_ids: number[];
}
