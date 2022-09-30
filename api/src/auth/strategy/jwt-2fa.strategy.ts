import { BadGatewayException, Injectable, Logger, NotFoundException, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "users/entity/user.entity";
import { UsersService } from "users/users.service";
import { AuthService } from "../auth.service";
import { UserAuth } from "../entity/user-auth.entity";

@Injectable()
export class JwtTFAStrategy extends PassportStrategy(Strategy, "jwt-2fa") {

	constructor(private authService: AuthService, private usersService: UsersService) {
		super({
		  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		  ignoreExpiration: false,
		  secretOrKey: process.env.JWT_SECRET_2FA
		});
	}

	async validate(jwtData: any) {
		let userAuth: UserAuth;
		try {
			userAuth = await this.authService.findOne(jwtData.id);
		} catch (err) {
			if (err instanceof NotFoundException)
				throw new UnauthorizedException('Unknown user.');
			if (err instanceof ServiceUnavailableException)
				throw err;
			Logger.error(`Unable to validate jwt strategy of ${JSON.stringify(jwtData)}: ${err.message}`, 'JWT 2FA')
			return null;
		}
		if (!userAuth.twoFactorSecret || jwtData.TFA_auth) {
			return userAuth;
		}
	}
}
