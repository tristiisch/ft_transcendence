import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../../users/users.service";
import { AuthService } from "../auth.service";
import { UserAuth } from "../entity/user-auth.entity";

@Injectable()
export class JwtTFAStrategy extends PassportStrategy(Strategy, "jwt-2fa"){
	constructor(private authService: AuthService) {
		super({
		  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		  ignoreExpiration: false,
		  secretOrKey: process.env.JWT_SECRET_2FA
		});
	}

	async validate(userId: number, payload: any) {
		const userAuth: UserAuth = await this.authService.findOne(userId);
		if (!userAuth.twoFactorSecret) {
			return userAuth;
		}
		else if (payload.TFA_auth) {
			return userAuth;
		}
	}
}
