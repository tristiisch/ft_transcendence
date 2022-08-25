import { Body, ClassSerializerInterceptor, Controller, ForbiddenException, Get, HttpCode, HttpStatus, ParseArrayPipe, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard';
import { JwtService } from '@nestjs/jwt';
import { UserRequest } from './interfaces/UserRequest.interface';
import { User } from 'src/users/entity/user.entity';
import { UserAuth } from './entity/user-auth.entity';




@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService, private jwtService: JwtService) {}
​
	@Post('42/redirect')
	async redirect(@Res() res: Response, @Req() req: Request) {
		try{
			if (!req.body.code)
				throw new ForbiddenException("42 Request error")
			const postData = {
				grant_type: 'authorization_code',
				client_id: process.env.FT_UID,
				client_secret: process.env.FT_SECRET,
				code: req.body.code,
				redirect_uri: `${process.env.FRONT_PREFIX}://${process.env.FRONT_HOST}:${process.env.FRONT_PORT}/${process.env.FRONT_REDIRECT}`
			};
			const url = process.env.FT_API;
			const result = await axios.post(url, postData);
			const headersRequest = { Authorization: 'Bearer ' + result.data.access_token };
			const userInfo = await axios.get(process.env.FT_API_ME, { headers: headersRequest });
			const user: User = await this.authService.UserConnecting(userInfo);
			const auth: UserAuth = await this.authService.findOne(user.id);
			delete auth.twoFactorSecret; // TODO Verif this method
			console.log('DEBUG LOGIN', 'auth:', auth);
			if (user && auth.has_2fa === true)
				res.json({ auth: auth }); // il est aussi de basculer sur le bon controller depuis le back
			else if (user)
				res.json({ auth: auth, user: user });
		} catch(err42) {
			throw new ForbiddenException("Unauthorized");
		}
	}
}

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TFAController {
	constructor(private readonly authService: AuthService,) {}

	@Get('generate')
	@UseGuards(JwtAuthGuard)
	async register(@Res() response: Response, @Req() request: Request) {
		const otpauthUrl = await this.authService.generateTFASecret(1);
		const qrCode = await this.authService.QrCodeStream(response, otpauthUrl);
		response.json(qrCode)
	}

	@Post('enable')
	@UseGuards(JwtAuthGuard)
	async enableTFA(@Req() req, @Body() data) {
		const user: User = req.user;
		const userAuth: UserAuth = await this.authService.findOne(user.id);
		const valid_code = this.authService.TFACodeValidation(data.code, userAuth);
		if (!valid_code)
			throw new UnauthorizedException('Wrong authentification code');
		await this.authService.enableTFA(req.user.user_id)
	}

	@Post('authenticate')
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	async authenticate(@Req() req, @Body() data) {
		const user: User = req.user;
		const userAuth: UserAuth = await this.authService.findOne(user.id);
		const isCodeValid = this.authService.TFACodeValidation(data.code, userAuth);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		return {
			auth: userAuth,
			user: user
		};
	}
}
