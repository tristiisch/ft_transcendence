import { Controller, Get, HttpCode, HttpStatus, ParseArrayPipe, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import  axios  from 'axios';
import { AuthService } from './auth.service';
import { FtAuthguard } from './guard';
import { JwtService } from '@nestjs/jwt';
import { FtPayload } from './interfaces/42user.interface';
import { NestFactory } from '@nestjs/core';



@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService, private jwtService: JwtService) {}

	@Post('42/redirect')
	//@UseGuards(FtAuthguard)
	async redirect(@Res() res: Response, @Req() req: Request) {
		const postData = {
			grant_type: 'authorization_code',
			client_id: process.env.FT_UID,
			client_secret: process.env.FT_SECRET,
			code: req.body.code,
			redirect_uri: process.env.FRONT_URL
		};
		const url = process.env.FT_API;
		const result = await axios.post(url, postData);
		const headersRequest = { Authorization: 'Bearer ' + result.data.access_token };
		const userInfo = await axios.get(process.env.FT_API_ME, { headers: headersRequest });
        console.log(userInfo);
		const user = await this.authService.UserConnecting(userInfo.data.login);

		res.json({
			token: 'fake-jwt-token',
			user: { 
				is_registered: false,
				id: user.id,
				avatar: userInfo.data.image_url,
				username: user.username,
				'2fa': false
			}});
		
	}
}
