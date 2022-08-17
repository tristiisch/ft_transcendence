import { Controller, ForbiddenException, Get, HttpCode, HttpStatus, ParseArrayPipe, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard';
import { JwtService } from '@nestjs/jwt';




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
				redirect_uri: process.env.FRONT_URL
			};
			const url = process.env.FT_API;
			const result = await axios.post(url, postData);
			const headersRequest = { Authorization: 'Bearer ' + result.data.access_token };
			const userInfo = await axios.get(process.env.FT_API_ME, { headers: headersRequest });
			console.log(result.data.access_token);
			//checker avec login si user existe
			//Si (il existe, ne pas créer et verifier si 2fa ON ou OFF)\
			//Si (2fa ON)
			//	dire au front que que le 2fa est ON
			//	(Créer token special 2fa)
			const user = await this.authService.UserConnecting(userInfo);
			if (user)
			res.json({
					auth: {
						user_id: user.id, // voir si on le garde ou pas
						token: await this.authService.createToken(user.id),
						has_2fa: false},
					user: user
				});
		}catch(err42){
			throw( new ForbiddenException("Unauthorized"))
		}
	}

	//inL:@Post('2fa')
	//async TwoFactorAuth(@Res() res: Response, @Req() req: Request){
	//
	//}
}


