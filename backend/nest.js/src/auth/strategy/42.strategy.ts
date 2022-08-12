import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, Profile } from "passport-42";
import * as dotenv from "dotenv";

dotenv.config();

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, 'ft'){
	constructor() {
		super({
			clientID: process.env.FT_UID,
			clientSecret: process.env.FT_SECRET,
			callbackURL: process.env.FT_REDIRECT,
			scope: ['public']
		});
	}


	validate(accessToken: string, refreshToken: string, profile: Profile){
		return profile;
	}
}
