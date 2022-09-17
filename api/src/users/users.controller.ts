/** @prettier */
import { Body, Controller, Delete, forwardRef, Get, Inject, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guard';
import { UserSelectDTO } from './entity/user-select.dto';
import { UserDTO } from './entity/user.dto';
import { User } from './entity/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {

	constructor(private readonly usersService: UsersService) {}

	// TODO: this work
	// @Inject(forwardRef(() => AuthService))
	// private readonly authService: AuthService;

	@UseGuards(JwtAuthGuard)
	@Get()
	getAllUsers(@Req() req): Promise<User[]> {
		return this.usersService.findAllExcept(req.user);
	}

	@Post()
	addUser(@Body() newUser: User) {
		return this.usersService.add(newUser);
	}

	/*
	@Get('name/:name')
	getUserByUsername(@Param('name') name: string): Promise<User> {
		return this.usersService.findOneByUsername(name);
	}

	@Get('login42/:login')
	getUserBy42Login(@Param('login') login: string): Promise<User> {
		return this.usersService.findOneBy42Login(login);
	}
	*/

	@UseGuards(JwtAuthGuard)
	@Patch('register')
	registerUser(@Req() req, @Body() userToUpdate: UserDTO) {
		const user: User = req.user;
		return this.usersService.register(user.id, userToUpdate);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('set-username')
	async updateUsername(@Req() req, @Body() userToUpdate: UserDTO) {
		const user: User = req.user;

		return await this.usersService.updateUsername(user.id, userToUpdate.username);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('set-avatar')
	async updateAvatar(@Req() req, @Body() userToUpdate: UserDTO) {
		const user: User = req.user;

		return await this.usersService.updateAvatar(user.id, userToUpdate.avatar_64);
	}

	@UseGuards(JwtAuthGuard)
	@Get('me')
	async getOwnInfo(@Req() req) {
		const user: User = req.user;
		// const userAuth: UserAuth = await this.authService.findOne(user.id);
		return user;
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
