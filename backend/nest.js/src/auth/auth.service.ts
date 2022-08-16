import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { isNumberPositive } from 'src/utils/utils';
import { Repository } from 'typeorm';
import { UserAuth } from './entity/user-auth.entity';


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
				user.avatar = userInfo42.data.image_url;
				user.status = UserStatus.ONLINE;
				user = await this.usersService.add(user);
			} else {
				throw err;
			}
		}
		userAuth = await this.findOne(user.id);
		if (!userAuth) {
			userAuth = new UserAuth();
			userAuth.token = 'fake-token';
			userAuth.twofa = null;
			this.save(userAuth);
		}
		return user;
	}

	public async createToken(id: number): Promise<string> {
		const payload = {
			id: id,
			secret: process.env.JWT_PASS,
		};
		return this.jwtService.signAsync(payload);
	}

	public async create2FaToken(id: number): Promise<string> {
		const payload = {
			id: id,
			secret: process.env.JWT_PASS,
			expires_in: "2min"
		};
		return this.jwtService.signAsync(payload);
	}

	async save(userAuth: UserAuth): Promise<UserAuth> {
		return this.authRepository.save(userAuth);
	}

	async findOne(userId: number): Promise<UserAuth> {
		isNumberPositive(userId, 'get a auth user');
		return this.authRepository.findOneBy({ user_id: userId });
	}
}
