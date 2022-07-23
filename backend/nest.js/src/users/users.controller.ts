import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { User } from 'src/users/interface/user.interface';
import { CreateUserDTO } from './dto/create-user.dto';
import { UsersService } from './users.service';

// localhost:3000/users
@Controller('users')
export class UsersController {

	constructor(private readonly usersService: UsersService) {}

	// localhost:3000/users/name/<name>
	@Get('name/:name')
	getUserByUsername(@Param('name') name: string): User {
		return this.usersService.getUserByUsername(name);
	}

	// localhost:3000/users/<id>
	@Get(':id')
	getUser(@Param('id') id: number): User {
		return this.usersService.getUser(id);
	}

	// localhost:3000/users
	@Get()
	getAllUsers(): User[] {
		return this.usersService.getAllUsers();
	}

	// localhost:3000/users
	@Post()
	// addUser(@Body() newUser) {
	addUser(@Body() newUser: CreateUserDTO) {
		console.log('new user want to be added : ', newUser)
		this.usersService.addUser(newUser)
	}

	// localhost:3000/users/<id>
	@Patch(':id')
	updateUser(@Param('id') id: number, @Body() userToUpdate: CreateUserDTO) {
		return this.usersService.updateUser(id, userToUpdate);
	}

	@Delete(':id')
	deleteUser(@Param('id') id: number) {
		return this.usersService.deleteUser(id);
	}
}
