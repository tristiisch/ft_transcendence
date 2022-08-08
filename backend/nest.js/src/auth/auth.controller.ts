import { Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
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
		let auth: boolean = false;
		const payload: FtPayload = { username, auth };
		const accessToken: string = this.jwtService.sign(payload);
		res.cookie('jwt', accessToken, {httpOnly: true});
		res.redirect(process.env.FRONT_URL);
	}
}
