/** @prettier */
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { UserAuth } from 'src/auth/entity/user-auth.entity';
import { JwtAuthGuard } from 'src/auth/guard';
import { UserSelectDTO } from './entity/user-select.dto';
import { UserDTO } from './entity/user.dto';
import { User } from './entity/user.entity';
import { UsersService } from './users.service';

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

	@Get('name/:name')
	getUserByUsername(@Param('name') name: string): Promise<User> {
		return this.usersService.findOneByUsername(name);
	}

	@Get('login42/:login')
	getUserBy42Login(@Param('login') login: string): Promise<User> {
		return this.usersService.findOneBy42Login(login);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('register')
	registerUser(@Req() req, @Body() userToUpdate: UserDTO) {
		const user: User = req.user;
		return this.usersService.register(user.id, userToUpdate);
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

	@Patch(':id')
	updateUser(@Param('id') id: number, @Body() userToUpdate: UserDTO) {
		return this.usersService.update(id, userToUpdate);
	}

	@Get(':id')
	getUser(@Param('id') id: number): Promise<User> {
		return this.usersService.findOne(id);
	}

	@Delete(':id')
	deleteUser(@Param('id') id: number) {
		return this.usersService.remove(id);
	}

	@Get('avatar/:id/id')
	async getAvatarById(@Param('id') id: number, @Res() res: Response) {
		const selectUser: UserSelectDTO = new UserSelectDTO();

		selectUser.id = id;
		return this.usersService.findAvatar(selectUser, res);
	}

	@Get('avatar/:username/username')
	async getAvatarByName(@Param('username') username: string, @Res() res: Response) {
		const selectUser: UserSelectDTO = new UserSelectDTO();

		selectUser.username = username;
		return this.usersService.findAvatar(selectUser, res);
	}
}
