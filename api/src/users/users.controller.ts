/** @prettier */
import { Body, Controller, Delete, forwardRef, Get, Inject, Logger, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { isNumberPositive } from 'utils/utils';
import { JwtAuthGuard } from 'auth/guard';
import { UserSelectDTO } from './entity/user-select.dto';
import { UserDTO } from './entity/user.dto';
import { User } from './entity/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {

	constructor(private readonly usersService: UsersService) {}

	@UseGuards(JwtAuthGuard)
	@Get()
	async getAllUsers(@Req() req): Promise<User[]> {
		return await this.usersService.findAllExcept(req.user);
	}

	@UseGuards(JwtAuthGuard)
	@Get('blocked-users')
	async blockedUsers(@Req() req) {
		const user: User = req.user;

		if (!user.blocked_ids)
			return [];
		const blockedUsers: User[] = new Array();
		for (const id of user.blocked_ids)
			blockedUsers.push(await this.usersService.findOne(id));
		return blockedUsers;
	}

	@UseGuards(JwtAuthGuard)
	@Patch('register')
	async egisterUser(@Req() req, @Body() userToUpdate: UserDTO) {
		const user: User = req.user;
		await this.usersService.register(user.id, userToUpdate);
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
		return user;
	}

	@UseGuards(JwtAuthGuard)
	@Get('delete')
	async anonymizeAccount(@Req() req) {
		const user: User = req.user;

		return this.usersService.anonymizeUser(user);
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

	@UseGuards(JwtAuthGuard)
	@Post('block')
	async blockUser(@Req() req, @Body() body: any) {
		const user: User = req.user;
		const targetId: number = body.id;
		const target: User = await this.usersService.findOne(targetId);
	
		await this.usersService.addBlockedUser(user, target);
		return { user: target, message: `You have block ${target.username}.` };
	}

	@UseGuards(JwtAuthGuard)
	@Post('unblock')
	async unblockUser(@Req() req, @Body() body: any) {
		const user: User = req.user;
		const targetId: number = body.id;
		const target: User = await this.usersService.findOne(targetId);

		await this.usersService.removeBlockedUser(user, target);
		return { user: target, message: `You have unblock ${target.username}.` };
	}

	@UseGuards(JwtAuthGuard)
	@Get(':id')
	getUser(@Param('id') id: number): Promise<User> {
		return this.usersService.findOne(id);
	}
}
