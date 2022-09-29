import { ConflictException, NotFoundException, PreconditionFailedException, ServiceUnavailableException, NotAcceptableException, InternalServerErrorException, Injectable, BadRequestException, Res, UnprocessableEntityException, Inject, forwardRef, UnsupportedMediaTypeException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { toBase64, isNumberPositive, fromBase64, removeFromArray, randomWord, checkImage } from "../utils/utils";
import { DataSource, DeleteResult, InsertResult, Repository, SelectQueryBuilder, UpdateResult } from "typeorm";
import { UserSelectDTO } from "./entity/user-select.dto";
import { UserDTO } from "./entity/user.dto";
import { User } from "./entity/user.entity";
import { Response } from 'express';
import { WsException } from "@nestjs/websockets";
import { AuthService } from "auth/auth.service";
import { SocketService } from 'socket/socket.service';
import { FriendsService } from "friends/friends.service";
import { NotificationService } from "notification/notification.service";
import { getAnoPicture } from "utils/ano";

@Injectable()
export class UsersService {

	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) {}

	@Inject(forwardRef(() => AuthService))
	private readonly authService: AuthService;
	@Inject(forwardRef(() => SocketService))
	private readonly socketService: SocketService;
	@Inject(FriendsService)
	private readonly friendsService: FriendsService;
	@Inject(forwardRef(() => NotificationService))
	private readonly notifService: NotificationService;

	public getRepo() {
		return this.usersRepository;
	}

	lambdaGetUser = (user: User, identifier: any) => {
		if (!user)
			throw new NotFoundException(`The user '${identifier}' does not exist.`);
		delete user.avatar_64;
		return user;
	};

	lambdaDatabaseUnvailable = (reason: string) => {
		throw new ServiceUnavailableException(`Database error with reason '${reason}'.`);
	};

	/*users: User[] = [
		{
			id: 1,
			username: 'tglory',
			email: 'tglory@student.42Lyon.fr'
		},
		{
			id: 2,
			username: 'alganoun',
			email: 'alganoun@student.42Lyon.fr'
		},
		{
			id: 3,
			username: 'jlaronch',
			email: 'jlaronch@student.42Lyon.fr'
		},
		{
			id: 4,
			username: 'nlaronch',
			email: 'nlaronch@student.42Lyon.fr'
		},
		{
			id: 5,
			username: 'bperez',
			email: 'bperez@student.42Lyon.fr'
		}
	];*/

	async findAll(): Promise<User[]> {
		const sqlStatement: SelectQueryBuilder<User> = this.usersRepository.createQueryBuilder('user')
			.where('user.username IS NOT NULL');
		return await sqlStatement.getMany().then(async (users: User[]) => {
			for (const user of users) delete user.avatar_64;
			return users;
		}, this.lambdaDatabaseUnvailable);
	}

	async findAllExcept(user: User): Promise<User[]> {
		const sqlStatement: SelectQueryBuilder<User> = this.usersRepository.createQueryBuilder('user')
			.where('user.username IS NOT NULL').andWhere('user.id != :id', { id: user.id });
		return await sqlStatement.getMany().then(async (users: User[]) => {
			for (const user of users) delete user.avatar_64;
			return users;
		}, this.lambdaDatabaseUnvailable);
	}

	async findOne(id: number): Promise<User> {
		isNumberPositive(id, 'find a user');
		return await this.usersRepository.findOneBy({ id }).then((user: User) => this.lambdaGetUser(user, id), this.lambdaDatabaseUnvailable);
	}

	async findOneWithCache(id: number, usersCached: User[]): Promise<User> {
		isNumberPositive(id, 'find a user');
		let user: User = usersCached.find((user: User) => user.id === id);
		if (user) {
			delete user.avatar_64;
			return user;
		}
		user = await this.usersRepository.findOneBy({ id }).then((user: User) => this.lambdaGetUser(user, id), this.lambdaDatabaseUnvailable);
		delete user.avatar_64;
		usersCached.push(user);
		return user;
	}

	async findOneByUsername(name: string): Promise<User> {
		if (!name || name.length == 0) {
			throw new PreconditionFailedException("Can't find a user by an empty name.");
		}
		return await this.usersRepository.findOne({ where: {username : name }}).then((user: User) => {
			return this.lambdaGetUser(user, name);
		}, this.lambdaDatabaseUnvailable);
	}

	async findOneBy42Login(login42: string): Promise<User> {
		if (!login42 || login42.length == 0) {
			throw new PreconditionFailedException("Can't find a user by an empty 42login.");
		}
		return await this.usersRepository.findOne({ where: { login_42: login42 } }).then((user: User) => {
			return this.lambdaGetUser(user, login42);
		}, this.lambdaDatabaseUnvailable);
	}

	async findOneWith42Login(): Promise<User> {
		const sqlStatement: SelectQueryBuilder<User> = this.usersRepository.createQueryBuilder('user').where('user.login_42 IS NOT NULL');
		return await sqlStatement.getOne().then(async (user: User) => {
			return user;
		}, this.lambdaDatabaseUnvailable);
	}

	async findMany(array: number[]): Promise<User[]> {
		if (!array || array.length === 0)
			return new Array();
		const sqlStatement: SelectQueryBuilder<User> = this.usersRepository.createQueryBuilder('user');
		const entries: IterableIterator<number[]> = array.entries();

		sqlStatement.where(`user.id = ${entries.next()['value'][1]}`);
		for (let i: number = 1; i < array.length; ++i)
			sqlStatement.orWhere(`user.id = ${entries.next()['value'][1]}`);

		return await sqlStatement.getMany().then(async (users: User[]) => {
			for (const user of users) delete user.avatar_64;
			return users;
		}, this.lambdaDatabaseUnvailable);
	}

	async findManyWithCache(array: number[], usersCached: User[]): Promise<User[] | null> {
		if (!array)
			return null;
		const users: User[] = new Array();
		let usersToFetch: number[];

		if (usersCached && usersCached.length !== 0)
			usersToFetch = array.filter(id => usersCached.find(u => u.id !== id));
		else
			usersToFetch = array;
		if (usersToFetch && usersToFetch.length > 0)
			usersCached = usersCached.concat(await this.findMany(usersToFetch));
	
		for (const [index, id] of array.entries()) {
			let cacheUser: User = usersCached.find((user: User) => user.id === id);
			if (cacheUser === undefined)
				throw new UnprocessableEntityException(`Can't get user ${id} with cache ${JSON.stringify(usersCached.map(user => user.id))}.`);
			users.push(cacheUser);
		}
		return users;
	}

	async remove(id: number) {
		isNumberPositive(id, 'remove a user');
		return await this.usersRepository.delete(id).then((value: DeleteResult) => {
			if (!value.affected || value.affected == 0) {
				throw new NotFoundException(`The user ${id} does not exist.`);
			} else {
				return { deleted : value.affected };
			}
		}, this.lambdaDatabaseUnvailable);
	}

	async add(newUser: User): Promise<User> {
		const sqlStatement: SelectQueryBuilder<User> = this.usersRepository.createQueryBuilder("user")
			.where("user.id = :id", { id: newUser.id })
			.orWhere("user.username = :username", { username: newUser.username });

		await sqlStatement.getOne().then((checkUserExist: User) => {
			if (checkUserExist)
				throw new ConflictException(`User ${checkUserExist.username} already exist with same id, email or username.`);
		}, this.lambdaDatabaseUnvailable);

		return await this.usersRepository.insert(newUser).then((insertResult: InsertResult) => {
			if (insertResult.identifiers.length < 1) {
				throw new InternalServerErrorException(`Can't add user ${newUser.username}.`);
			} else if (insertResult.identifiers.length > 1) {
				throw new InternalServerErrorException(insertResult.identifiers.length + " rows was modify instead of one.");
			}
			return newUser;
		}, this.lambdaDatabaseUnvailable);
	}

	async updateUsername(userId: number, username: string): Promise<User> {
		try {
			await this.usersRepository.update(userId, { username: username }).catch(this.lambdaDatabaseUnvailable);
		} catch (err) {
			if (err instanceof ServiceUnavailableException && err.message.includes('duplicate key value violates unique constraint'))
				throw new PreconditionFailedException('Username already taken.');
			else
				throw err;
		}
		return await this.findOne(userId);
	}

	async updateAvatar(userId: number, avatar_64: string): Promise<User> {
		checkImage(avatar_64);
		await this.usersRepository.update(userId, { avatar_64: avatar_64 }).catch(this.lambdaDatabaseUnvailable);
		const user: User = await this.findOne(userId);

		return user;
	}

	async register(userId: number, user: UserDTO) {
		const userBefore: User = await this.findOne(userId);
		if (userBefore.username !== null)
			throw new BadRequestException(`You are already registered.`);

		try {
			if (user.avatar_64 != null && user.avatar_64 != '') {
				checkImage(user.avatar_64);
				this.usersRepository.update(userId, { avatar_64: user.avatar_64, username: user.username }).catch(this.lambdaDatabaseUnvailable);
			} else
				this.usersRepository.update(userId, { username: user.username }).catch(this.lambdaDatabaseUnvailable);
		} catch (err) {
			if (err instanceof ServiceUnavailableException && err.message.includes('duplicate key value violates unique constraint'))
				throw new PreconditionFailedException('Username already taken.');
			else 
				throw err;
		}
		return await this.findOne(userId);
	}

	async findAvatar(selectUser: UserSelectDTO, @Res() res: Response) {
		let target: User;
		if (selectUser.id != null) {
			target = await this.usersRepository.findOneBy({ id: selectUser.id });
			if (!target)
				throw new NotFoundException(`The user '${selectUser.id}' didn't exist.`)
		} else if (selectUser.username != null) {
			target = await this.usersRepository.findOneBy({ username: selectUser.username });
			if (!target)
				throw new NotFoundException(`The user '${selectUser.username}' didn't exist.`)
		} else
			throw new NotAcceptableException("Unable to find a user without key 'id' or 'username'.");

		const avatar: { imageType: any; imageBuffer: any; } = fromBase64(target.avatar_64);
		if (!avatar) {
			Logger.error(`Can't get a valid image from ${target.avatar_64} for ${target.username}.`, 'AvatarUser');
			throw new UnsupportedMediaTypeException(`Can't get a valid image from ${target.avatar_64} for ${target.username}.`);
		}

		res.writeHead(200, { 'Content-Type': avatar.imageType, 'Content-Length': avatar.imageBuffer.length });
		res.end(avatar.imageBuffer);
	}

	async addBlockedUser(user: User, target: User): Promise<User> {
		if (user.id === target.id)
			throw new PreconditionFailedException("Can't block yourself");
		if (!user.blocked_ids) {
			user.blocked_ids = new Array();
			await this.usersRepository.update(user.id, { blocked_ids: [target.id] });
		} else if (user.blocked_ids.indexOf(target.id) !== -1)
			throw new PreconditionFailedException(`${target.username} is already blocked`)

		user.blocked_ids.push(target.id);
		try {
			await this.friendsService.declineFriendShipIgnore(user, target);
			await this.notifService.removeNotifFriendRequest(user, target);
		} catch (err) {
			if (!(err instanceof NotAcceptableException))
				throw err;
		} finally {
			await this.usersRepository.update(user.id, { blocked_ids: user.blocked_ids });
		}
		return user;
	}

	async removeBlockedUser(user: User, target: User): Promise<User> {
		if (user.id === target.id)
			throw new PreconditionFailedException("Can't unblock yourself");
		if (!user.blocked_ids || user.blocked_ids.indexOf(target.id) === -1)
			throw new NotFoundException('This user is not blocked.');
		if (user.blocked_ids.length == 1)
			user.blocked_ids = null;
		else
			user.blocked_ids = removeFromArray(user.blocked_ids, target.id);

		await this.usersRepository.update(user.id, { blocked_ids: user.blocked_ids });
		return user;
	}
	
	async anonymizeUser(user: User) : Promise<User> {
		//user.avatar_64 = await toBase64(`http://${process.env.FRONT_HOSTNAME_FOR_API}:${process.env.FRONT_PORT}/src/assets/anonymize.png`);
		user.avatar_64 = getAnoPicture();
		user.username = `${randomWord(3)}-${randomWord(5)}`
		user.login_42 = null;
		await this.authService.delete(user);
		await this.usersRepository.update(user.id, { username: user.username, login_42: user.login_42, avatar_64: user.avatar_64 });
		delete user.avatar_64;
		return user;
	}

	public isBlockedByUser(userBlocked: User, userWhoBlock: User) {
		return userWhoBlock.isBlockedUser(userBlocked.id);
	}
}
