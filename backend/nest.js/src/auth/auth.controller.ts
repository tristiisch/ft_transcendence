import { Controller, Get, HttpCode, HttpStatus, ParseArrayPipe, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { Axios } from 'axios';
import { AuthService } from './auth.service';
import { FtAuthguard } from './guard';
import { JwtService } from '@nestjs/jwt';
import { FtPayload } from './interfaces/42user.interface';



@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService, private jwtService: JwtService) {}

	@Get("42/login")
	@UseGuards(FtAuthguard)
	login(@Req() req: Request) {
	}

	@Get('42/redirect')
	@UseGuards(FtAuthguard)
	async redirect(@Res() res: Response, @Req() req: Request) {
		const username = req.user['username'];
		console.log(req.user);
		const user = await this.authService.UserConnecting(username);
		let auth: boolean = false;
		const userid = user.id;
		const payload: FtPayload = { userid, username, auth };
		const accessToken = this.jwtService.signAsync(payload, {
			expiresIn: "15m",
			secret: process.env.JWT_SECRET
		});
		res.cookie('jwt', accessToken, {httpOnly: true});
		res.redirect(process.env.FRONT_URL);
		return(accessToken);
	}
}
