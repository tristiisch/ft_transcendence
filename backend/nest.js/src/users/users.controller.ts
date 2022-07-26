import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from './entity/user.entity';
import { UsersService } from './users.service';

// localhost:3000/users
@Controller('users')
export class UsersController {

	constructor(private readonly usersService: UsersService) {}

	// localhost:3000/users/name/<name>
	@Get('name/:name')
	getUserByUsername(@Param('name') name: string): Promise<User> {
		return this.usersService.findOneByUsername(name);
	}

	// localhost:3000/users/<id>
	@Get(':id')
	getUser(@Param('id') id: number): Promise<User> {
		return this.usersService.findOne(id);
	}

	// localhost:3000/users
	@Get()
	getAllUsers(): Promise<User[]> {
		return this.usersService.findAll();
	}

	// localhost:3000/users
	@Post()
	// addUser(@Body() newUser: CreateUserDTO) {
	addUser(@Body() newUser) {
		console.log('new user want to be added : ', newUser)
		this.usersService.add(newUser);
	}

	// localhost:3000/users/<id>
	@Patch(':id')
	updateUser(@Param('id') id: number, @Body() userToUpdate: CreateUserDTO) {
		return this.usersService.update(id, userToUpdate);
	}

	// localhost:3000/users/<id>
	@Delete(':id')
	deleteUser(@Param('id') id: number) {
		return this.usersService.remove(id);
	}
}
