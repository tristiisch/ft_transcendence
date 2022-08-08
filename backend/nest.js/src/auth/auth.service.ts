import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService, private usersService: UsersService){
	}

	async UserConnecting(username: string){

		const user = await this.usersService.findOneByUsername(username);
		if (!user){
			//creation de l'user
			//creation connection
		}
	}

	public async createToken(username: string): Promise<string> {
		return this.jwtService.sign({username: username});
	}
}
