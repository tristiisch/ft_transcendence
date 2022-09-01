import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { isNumberPositive, toBase64 } from 'src/utils/utils';
import { Repository } from 'typeorm';
import { UserAuth } from './entity/user-auth.entity';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { StatsService } from 'src/game/stats/stats.service';
import { UserStats } from 'src/game/stats/entity/userstats.entity';

@Injectable()
export class AuthService {

	private temp2FASecret: Map<number, string> = new Map();

	constructor(private jwtService: JwtService,
		@InjectRepository(UserAuth)
		private authRepository: Repository<UserAuth>){
	}

	@Inject(UsersService)
	private readonly usersService: UsersService;
	@Inject(StatsService)
	private readonly statsService: StatsService;

	getRepo() {
		return this.authRepository;
	}

	async UserConnecting(userInfo42: any): Promise<{ user: User, userAuth: UserAuth }> {
		let user: User;
		let userAuth: UserAuth;
		let userStats: UserStats;
		try {
			user = await this.usersService.findOneBy42Login(userInfo42.data.login);
		} catch (err) {
			if (err instanceof NotFoundException) {
				user = new User;
				// user.username = userInfo42.data.login; Est définie a null tant que l'user n'est pas register
				user.login_42 = userInfo42.data.login;
				user.username = null;
				user.avatar_64 = await toBase64(userInfo42.data.image_url);
				user.status = UserStatus.ONLINE;
				user = await this.usersService.add(user);
				user.defineAvatar(); // TODO remove it (c'est pour que le front reçoit l'url de l'avatar et non le code en base64)
			} else {
				throw err;
			}
		}
		userAuth = await this.findOne(user.id);
		if (!userAuth) {
			userAuth = new UserAuth(user.id);
			userAuth.token_jwt = await this.createToken(user.id);
			this.save(userAuth);
		}
		userStats = await this.statsService.findOneById(user.id);
		if (!userStats) {
			userStats = new UserStats(user.id);
			this.statsService.add(userStats);
		}
		return { user, userAuth };
	}

	async UserConnectingTFA(userId: number){
		let user: User;
		try {
			user = await this.usersService.findOne(userId);
		} catch (err) {
			throw err;
		}
		user.status = UserStatus.ONLINE;
		return user;
	}

	public async generateTFASecret(user: User) {
		this.temp2FASecret.delete(user.id);
		const secret: string = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(user.login_42, process.env.TFA_APP, secret);

		console.log('Secret 2FA', secret);
		this.temp2FASecret.set(user.id, secret);
		return otpauthUrl;
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
			secret: process.env.JWT_SECRET_2FA,
			expiresIn: "2min" // prévoir une variable pour l'expiration du token
		});
	}

	public async createTFAToken(id: number): Promise<string> {
		const payload = {
			id: id,
			TFA_auth: true
		};
		return this.jwtService.signAsync(payload, {
			secret: process.env.JWT_SECRET_2FA,
		});
	}

	async save(userAuth: UserAuth): Promise<UserAuth> {
		return this.authRepository.save(userAuth);
	}

	async findOne(userId: number): Promise<UserAuth> {
		isNumberPositive(userId, 'get a auth user');
		const userAuth: UserAuth = await this.authRepository.findOneBy({ user_id: userId });
		if (!userAuth)
			return null;
		/*if (userAuth.twoFactorSecret != null)
			userAuth.has_2fa = true;
		else
			userAuth.has_2fa = false;*/
		return userAuth;
	}

	public TFACodeValidationEnable(code: string, userId: number){
		if (!this.temp2FASecret.has(userId))
			throw new BadRequestException('BadRequest: You should generate a 2FA QRCode before send code.');
		const twoFactorSecret: string = this.temp2FASecret.get(userId);
		return authenticator.verify({
			token: code,
			secret: twoFactorSecret
		})
	}

	public TFACodeValidationAuthenticate(code: string, userAuth: UserAuth){
		return authenticator.verify({
			token: code,
			secret: userAuth.twoFactorSecret
		})
	}

	async enableTFA(userId: number) {
		if (!this.temp2FASecret.has(userId))
			throw new BadRequestException('BadRequest: You should generate a 2FA QRCode before enable 2FA.');
		const secret = this.temp2FASecret.get(userId);
		return this.authRepository.update(userId, { twoFactorSecret: secret });
	}

	async disableTFA(userId: number) {
		this.temp2FASecret.delete(userId);
		return this.authRepository.update(userId, { twoFactorSecret: null });
	}

	public async QrCodeStream(otpauthUrl: string) {
		const imagePath = await toDataURL(otpauthUrl);
		return imagePath;
	}
}
