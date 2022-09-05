import { Injectable, NotFoundException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt} from "passport-jwt";
import { UsersService } from "../../users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt"){
	constructor(private usersService: UsersService) {
		super({
		  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		  ignoreExpiration: false,
		  secretOrKey: process.env.JWT_SECRET
		});
	}

	async validate(jwtData: any) {
		try {
			return await this.usersService.findOne(jwtData.id);
		} catch (err) {
			if (err instanceof NotFoundException)
				return null;
			console.log("ERROR with validate jwt strategy of '", jwtData, "'", err);
			return null;
		}
	}

}
