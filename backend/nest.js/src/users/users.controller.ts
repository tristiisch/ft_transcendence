import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post } from '@nestjs/common';
import { UserDTO } from './entity/user.dto';
import { User } from './entity/user.entity';
import { UsersService } from './users.service';

// localhost:3000/users
@Controller('users')
export class UsersController {

	constructor(private readonly usersService: UsersService) {}

	// localhost:3000/users
	@Get()
	getAllUsers(): Promise<User[]> {
		return this.usersService.findAll();
	}

	// localhost:3000/users
	@Post()
	addUser(@Body() newUser: User) {
		return this.usersService.add(newUser);
	}

	// localhost:3000/users/<id>
	@Get(':id')
	getUser(@Param('id') id: number): Promise<User> {
		return this.usersService.findOne(id);
	}

	// localhost:3000/users/<id>
	@Patch(':id')
	updateUser(@Param('id') id: number, @Body() userToUpdate: UserDTO) {
		return this.usersService.update(id, userToUpdate);
	}

	// localhost:3000/users/<id>
	@Delete(':id')
	deleteUser(@Param('id') id: number) {
		return this.usersService.remove(id);
	}

	// localhost:3000/users/name/<name>
	@Get('name/:name')
	getUserByUsername(@Param('name') name: string): Promise<User> {
		return this.usersService.findOneByUsername(name);
	}

	// localhost:3000/users/email/<email>
	@Get('email/:email')
	getUserByEmail(@Param('email') email: string): Promise<User> {
		return this.usersService.findOneByEmail(email);
	}
}
