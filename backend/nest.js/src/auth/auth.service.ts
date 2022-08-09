import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserStatus } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService, private usersService: UsersService){
	}

	async UserConnecting(username: string){
		let user: User;
		try {
			user = await this.usersService.findOneByUsername(username);
		} catch (err) {
			if (err instanceof NotFoundException) {
				user = new User;
				user.username = username;
				user.status = UserStatus.ONLINE;
				this.usersService.add(user);
			} else {
				throw err;
			}
		}
	//	if (!user){
	//	}
	}

	public async createToken(username: string): Promise<string> {
		return this.jwtService.sign({username: username});
	}
}
