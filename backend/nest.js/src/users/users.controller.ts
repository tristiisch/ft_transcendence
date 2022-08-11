import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post } from '@nestjs/common';
import { UserDTO } from './entity/user.dto';
import { User } from './entity/user.entity';
import { UsersService } from './users.service';

// localhost:3000/users
@Controller('users')
export class UsersController {

	constructor(private readonly usersService: UsersService) {}

	@Get()
	getAllUsers(): Promise<User[]> {
		return this.usersService.findAll();
	}

	@Post()
	addUser(@Body() newUser: User) {
		return this.usersService.add(newUser);
	}

	@Get(':id')
	getUser(@Param('id') id: number): Promise<User> {
		return this.usersService.findOne(id);
	}

	@Get('name/:name')
	getUserByUsername(@Param('name') name: string): Promise<User> {
		return this.usersService.findOneByUsername(name);
	}

	@Get('42id/:id')
	getUserBy42Id(@Param('id') id: number): Promise<User> {
		return this.usersService.findOneBy42Id(id);
	}

	@Patch(':id')
	updateUser(@Param('id') id: number, @Body() userToUpdate: UserDTO) {
		return this.usersService.update(id, userToUpdate);
	}
	
	@Patch('me/:id/set-username')
	async updateUsername(@Param('id') id: number, @Body() userToUpdate: UserDTO) {
		const user: User = await this.usersService.findOne(id);

		user.username = userToUpdate.username;
		return await this.usersService.update(id, user);
	}

	@Patch('me/:id/set-avatar')
	async updateAvatar(@Param('id') id: number, @Body() userToUpdate: UserDTO) {
		const user: User = await this.usersService.findOne(id);

		user.avatar = userToUpdate.avatar;
		return await this.usersService.update(id, user);
	}

	@Delete(':id')
	deleteUser(@Param('id') id: number) {
		return this.usersService.remove(id);
	}

}
