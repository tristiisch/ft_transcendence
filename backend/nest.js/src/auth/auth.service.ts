import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserStatus } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService, private usersService: UsersService){
	}

	async UserConnecting(userInfo42: any){
		let user: User;
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
		return user;
	}

	public async createToken(username: string): Promise<string> {
		return this.jwtService.sign({username: username});
	}
}
