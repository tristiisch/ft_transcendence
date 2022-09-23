import { BadGatewayException, Injectable, Logger, NotFoundException, PreconditionFailedException, ServiceUnavailableException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt} from "passport-jwt";
import { UsersService } from "../../users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {

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
				throw new BadGatewayException('Unknown user.');
			if (err instanceof ServiceUnavailableException)
				throw err;
			Logger.error(`Unable to validate jwt strategy of ${JSON.stringify(jwtData)}: ${err.message}`, 'JWT')
			return null;
		}
	}

}
