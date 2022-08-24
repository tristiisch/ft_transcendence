import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { isNumberPositive, toBase64 } from 'src/utils/utils';
import { Repository } from 'typeorm';
import { UserAuth } from './entity/user-auth.entity';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { Response } from 'express';

@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService, private usersService: UsersService,
		@InjectRepository(UserAuth)
		private authRepository: Repository<UserAuth>){
	}

	async UserConnecting(userInfo42: any){
		let user: User;
		let userAuth: UserAuth;
		try {
			user = await this.usersService.findOneBy42Login(userInfo42.data.login);
		} catch (err) {
			if (err instanceof NotFoundException) {
				user = new User;
				// user.username = userInfo42.data.login; Est définie a null tant que l'user n'est pas register
				user.login_42 = userInfo42.data.login;
				user.avatar = await toBase64(userInfo42.data.image_url);
				user.status = UserStatus.ONLINE;
				user = await this.usersService.add(user);
			} else {
				throw err;
			}
		}
		userAuth = await this.findOne(user.id);
		if (!userAuth) {
			userAuth = new UserAuth(user.id);
			userAuth.token = await this.createToken(user.id);
			userAuth.twofa = null;
			this.save(userAuth);
		}
		user.defineAvatar(); // TODO remove it (c'est pour que le front reçoit l'url de l'avatar et non le code en base64)
		return user;
	}

	async UserConnectingTFA(userId: number){
		let user: User;
		try {
			user = await this.usersService.findOne(userId);
		} catch (err) {
			throw err;
		}
		user.status = UserStatus.ONLINE;
		user.defineAvatar(); // TODO remove it (c'est pour que le front reçoit l'url de l'avatar et non le code en base64)
		return user;
	}

	public async generateTFASecret(userId: number) {
		const secret = authenticator.generateSecret();
		const user = await this.usersService.findOne(userId);
		const otpauthUrl = authenticator.keyuri(
			user.login_42, process.env.TFA_APP, secret);
		await this.setTFASecret(secret, userId);
		return {
			secret,
			otpauthUrl
		}
	}


	public async createToken(id: number): Promise<string> {
		const payload = { id: id };
		return this.jwtService.signAsync(payload, {
			secret: process.env.JWT_SECRET,
		});
	}

	public async createTempToken(id: number): Promise<string> {
		const payload = { id: id };
		return this.jwtService.signAsync(payload, {
			secret: process.env.JWT_SECRET,
			expiresIn: "2min" // prévoir une variable pour l'expiration du token
		});
	}

	public async createTFAToken(id: number): Promise<string> {
		const payload = {
			id: id,
			TFA_auth: true
		};
		return this.jwtService.signAsync(payload, {
			secret: process.env.JWT_SECRET,
		});
	}

	async save(userAuth: UserAuth): Promise<UserAuth> {
		return this.authRepository.save(userAuth);
	}

	async findOne(userId: number): Promise<UserAuth> {
		isNumberPositive(userId, 'get a auth user');
		return this.authRepository.findOneBy({ user_id: userId });
	}

	async setTFASecret(secret: string, userId: number) {
		return this.authRepository.update(userId, {
		  twofa: secret
		});
	}

	public async TFACodeValidation(code: string, user: UserAuth){
		return authenticator.verify({
			token: code,
			secret: user.twofa
		})
	}

	async enableTFA(userId: number) {
		return this.authRepository.update(userId, {
			has_2fa: true
		});
	}

	public async QrCodeStream(stream: Response, otpauthUrl: string) {
		return toFileStream(stream, otpauthUrl);
	}

}
