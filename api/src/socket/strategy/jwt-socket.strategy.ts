import { BadGatewayException, Injectable, Logger, NotFoundException, PreconditionFailedException, ServiceUnavailableException } from "@nestjs/common";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt} from "passport-jwt";
import { UsersService } from "../../users/users.service";

@Injectable()
export class JwtStrategySocket extends PassportStrategy(Strategy, 'jwt-socket'){
	constructor(private usersService: UsersService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([(req: any) => { return req.handshake?.auth?.token; }, ]),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET
		});
	}

	async validate(jwtData: any) {
		try {
			return await this.usersService.findOne(jwtData.id);
		} catch (err) {
			if (err instanceof NotFoundException)
				throw new BadGatewayException('Unknown user.');
			if (err instanceof ServiceUnavailableException)
				throw err;
			Logger.error(`Unable to validate jwt strategy of ${jwtData}: ${err.message}`, 'JWT Socket')
			return null;
		}
	}

}

@Injectable()
export class JwtSocketGuard extends AuthGuard('jwt-socket'){
	constructor() {
		super();
	}
}