import { BadRequestException, Body, ClassSerializerInterceptor, Controller, ForbiddenException, forwardRef, Get, HttpCode, HttpStatus, Inject, Logger, Param, ParseArrayPipe, Post, PreconditionFailedException, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';
import { AuthService } from './auth.service';
import { JwtAuthGuard, JwtTFAuthGuard } from './guard';
import { JwtService } from '@nestjs/jwt';
import { User } from 'users/entity/user.entity';
import { UserAuth } from './entity/user-auth.entity';
import { UsersService } from 'users/users.service';
import { getFrontRelativeURL } from 'utils/utils';

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService, private jwtService: JwtService) {}

	@Inject(forwardRef(() => UsersService))
	private readonly usersService: UsersService;

	@Post('42/redirect')
	async redirect(@Res() res: Response, @Req() req: Request) {
		if (!req.body.code)
			throw new PreconditionFailedException("Unauthorized - Code undefined")
		let result: any;
		try {
			const postData = {
				grant_type: 'authorization_code',
				client_id: process.env.VITE_FT_UID,
				client_secret: process.env.FT_SECRET,
				code: req.body.code,
				// redirect_uri: process.env.VITE_FT_OAUTH_REDIRECT
				redirect_uri: `${getFrontRelativeURL(req)}/login`
			};
			const url = process.env.FT_API;
			result = await axios.post(url, postData);
		} catch (err42) {
			Logger.error(`Unable to connect to 42 API Verify UID, Secret env vars and relative redirect URI ${getFrontRelativeURL(req)}/login : ${err42.message}`, 'API42');
			throw new ForbiddenException("Unauthorized - Unable to connect to 42 API");
		}

		let userInfo: any;
		try {
			const headersRequest = { Authorization: 'Bearer ' + result.data.access_token };
			userInfo = await axios.get(process.env.FT_API_ME, { headers: headersRequest });
		} catch (err42) {
			throw new ForbiddenException("Unauthorized - Unable to get your infos with 42 API");
		}
		const { user, userAuth } = await this.authService.UserConnecting(userInfo);
		delete userAuth.twoFactorSecret; // TODO Verif this method

		if (!user)
			throw new BadRequestException('User is null');

		if (userAuth.has_2fa === true) {
			const jwtToken2FA: string = await this.authService.createTFAToken(user.id);
			userAuth.token_jwt = jwtToken2FA;
			res.json({ auth: userAuth });
		}
		else
			res.json({ auth: userAuth, user: user });
	}

	@Get('fakelogin/:username')
	async fakeLogin(@Req() req: Request, @Param('username') username: string) {
		const user: User = await this.usersService.findOneByUsername(username);
		const userAuth: UserAuth = await this.authService.findOne(user.id);

		return { auth: userAuth, user: user };
	}

	@UseGuards(JwtAuthGuard)
	@Get('me')
	async getOwnInfo(@Req() req) {
		const user: User = req.user;
		const userAuth: UserAuth = await this.authService.findOne(user.id);
		delete userAuth.twoFactorSecret;
		return userAuth;
	}
}

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TFAController {

	constructor(private readonly authService: AuthService) {}

	@Inject(forwardRef(() => UsersService))
	private readonly usersService: UsersService;

	@Get('generate')
	@UseGuards(JwtAuthGuard)
	async register(@Req() req, @Res() response: Response) {
		const user: User = req.user;
		const otpauthUrl = await this.authService.generateTFASecret(user);
		const qrCode = await this.authService.QrCodeStream(otpauthUrl);
		response.json(qrCode)
	}

	@Post('enable')
	@UseGuards(JwtAuthGuard)
	async enableTFA(@Req() req, @Body() data) {
		const user: User = req.user;
		const code: string = data.twoFacode;
		const valid_code: boolean = this.authService.TFACodeValidationEnable(code, user.id);
		if (!valid_code)
			throw new ForbiddenException('Wrong authentification code');

		await this.authService.enableTFA(user.id)
	}

	@Post('authenticate')
	@HttpCode(200)
	@UseGuards(JwtTFAuthGuard)
	async authenticate(@Req() req, @Body() data) {
		const userAuth: UserAuth = req.user;
		const user: User = await this.usersService.findOne(userAuth.user_id);

		const code: string = data.otpToken;
		const isCodeValid = this.authService.TFACodeValidationAuthenticate(code, userAuth);
		if (!isCodeValid) {
			throw new ForbiddenException('Wrong authentication code');
		}
		return {
			auth: userAuth,
			user: user
		};
	}

	@Get('disable')
	@UseGuards(JwtAuthGuard)
	async disable(@Req() req) {
		const user: User = req.user;
		this.authService.disableTFA(user.id);
	}
}
