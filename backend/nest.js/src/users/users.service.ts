import {
	ConflictException,
	NotFoundException,
	PreconditionFailedException,
	ServiceUnavailableException,
	NotAcceptableException,
	InternalServerErrorException,
	Injectable,
	BadRequestException,
	Res,
	UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { toBase64, isNumberPositive, fromBase64, removeFromArray } from '../utils/utils';
import {
	DataSource,
	DeleteResult,
	InsertResult,
	Repository,
	SelectQueryBuilder,
	UpdateResult,
} from 'typeorm';
import { UserSelectDTO } from './entity/user-select.dto';
import { UserDTO } from './entity/user.dto';
import { User } from './entity/user.entity';
import { Response } from 'express';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>
	) // private dataSource: DataSource
	{}

	public getRepo() {
		return this.usersRepository;
	}

	lambdaGetUser = (user: User, identifier: any) => {
		if (!user) throw new NotFoundException(`The user '${identifier}' does not exist.`);
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
		const sqlStatement: SelectQueryBuilder<User> = this.usersRepository
			.createQueryBuilder('user')
			.where('user.username IS NOT NULL');
		return await sqlStatement.getMany().then(async (users: User[]) => {
			for (const user of users) delete user.avatar_64;
			return users;
		}, this.lambdaDatabaseUnvailable);
	}

	async findOne(id: number): Promise<User> {
		isNumberPositive(id, 'get a user');
		return await this.usersRepository
			.findOneBy({ id })
			.then((user: User) => this.lambdaGetUser(user, id), this.lambdaDatabaseUnvailable);
	}

	async findOneWithCache(id: number, usersCached: User[]): Promise<User> {
		isNumberPositive(id, 'get a user');
		let user: User = usersCached.find((user: User) => user.id === id);
		if (user !== undefined) return user;
		user = await this.usersRepository
			.findOneBy({ id })
			.then((user: User) => this.lambdaGetUser(user, id), this.lambdaDatabaseUnvailable);
		usersCached.push(user);
		return user;
	}

	async findOneByUsername(name: string): Promise<User> {
		if (!name || name.length == 0) {
			throw new PreconditionFailedException("Can't get a user by an empty name.");
		}
		return await this.usersRepository
			.findOne({ where: { username: name } })
			.then((user: User) => {
				return this.lambdaGetUser(user, name);
			}, this.lambdaDatabaseUnvailable);
	}

	async findOneBy42Login(login42: string): Promise<User> {
		if (!login42 || login42.length == 0) {
			throw new PreconditionFailedException("Can't get a user by an empty 42login.");
		}
		return await this.usersRepository
			.findOne({ where: { login_42: login42 } })
			.then((user: User) => {
				return this.lambdaGetUser(user, login42);
			}, this.lambdaDatabaseUnvailable);
	}

	async remove(id: number) {
		isNumberPositive(id, 'remove a user');
		return await this.usersRepository.delete(id).then((value: DeleteResult) => {
			if (!value.affected || value.affected == 0) {
				throw new NotFoundException(`The user ${id} does not exist.`);
			} else {
				return { deleted: value.affected };
			}
		}, this.lambdaDatabaseUnvailable);
	}

	async add(newUser: User): Promise<User> {
		const sqlStatement: SelectQueryBuilder<User> = this.usersRepository
			.createQueryBuilder('user')
			.where('user.id = :id', { id: newUser.id })
			.orWhere('user.username = :username', { username: newUser.username });

		await sqlStatement.getOne().then((checkUserExist: User) => {
			if (checkUserExist)
				throw new ConflictException(
					`User ${checkUserExist.username} already exist with same id, email or username.`
				); // TODO Change msg for client
		}, this.lambdaDatabaseUnvailable);

		return await this.usersRepository.insert(newUser).then((insertResult: InsertResult) => {
			// This didn't use anotations check of User or UserDTO !!
			if (insertResult.identifiers.length < 1) {
				throw new InternalServerErrorException(`Can't add user ${newUser.username}.`);
			} else if (insertResult.identifiers.length > 1) {
				throw new InternalServerErrorException(
					insertResult.identifiers.length + ' rows was modify instead of one.'
				);
			}
			return newUser;
		}, this.lambdaDatabaseUnvailable);
	}

	async updateUsername(userId: number, username: string): Promise<User> {
		try {
			await this.usersRepository
				.update(userId, { username: username })
				.catch(this.lambdaDatabaseUnvailable);
		} catch (err) {
			if (
				err instanceof ServiceUnavailableException &&
				err.message.includes('duplicate key value violates unique constraint')
			)
				throw new PreconditionFailedException('Username already taken.');
			else throw err;
		}
		return await this.findOne(userId);
	}

	async updateAvatar(userId: number, avatar_64: string): Promise<User> {
		fromBase64(avatar_64);
		if (!fromBase64(avatar_64))
			throw new PreconditionFailedException(
				`Unable to accept '${
					avatar_64.substring(0, 16) + (avatar_64.length > 16 ? '...' : '')
				}' as avatar_64.`
			);
		await this.usersRepository
			.update(userId, { avatar_64: avatar_64 })
			.catch(this.lambdaDatabaseUnvailable);
		return await this.findOne(userId);
	}

	async register(userId: number, user: UserDTO) {
		const userBefore: User = await this.findOne(userId);
		if (userBefore.username !== null)
			throw new BadRequestException(`You are already registered.`);

		try {
			if (user.avatar_64 != null && (user.avatar_64 = await toBase64(user.avatar_64)) != null)
				this.usersRepository
					.update(userId, { avatar_64: user.avatar_64, username: user.username })
					.catch(this.lambdaDatabaseUnvailable);
			else
				this.usersRepository
					.update(userId, { username: user.username })
					.catch(this.lambdaDatabaseUnvailable);
		} catch (err) {
			if (
				err instanceof ServiceUnavailableException &&
				err.message.includes('duplicate key value violates unique constraint')
			)
				throw new PreconditionFailedException('Username already taken.');
			else throw err;
		}
		return await this.findOne(userId);
	}

	async findAvatar(selectUser: UserSelectDTO, @Res() res: Response) {
		let target: User;
		if (selectUser.id != null) {
			target = await this.usersRepository.findOneBy({ id: selectUser.id });
			if (!target) throw new NotFoundException(`The user '${selectUser.id}' didn't exist.`);
		} else if (selectUser.username != null) {
			target = await this.usersRepository.findOneBy({ username: selectUser.username });
			if (!target)
				throw new NotFoundException(`The user '${selectUser.username}' didn't exist.`);
		} else
			throw new NotAcceptableException(
				"Unable to find a user without key 'id' or 'username'."
			);

		const avatar: { imageType: any; imageBuffer: any } = fromBase64(target.avatar_64);

		res.writeHead(200, {
			'Content-Type': avatar.imageType,
			'Content-Length': avatar.imageBuffer.length,
		});
		res.end(avatar.imageBuffer);
	}

	async arrayIdsToUsers(array: number[]): Promise<User[]> {
		const sqlStatement: SelectQueryBuilder<User> =
			this.usersRepository.createQueryBuilder('user');
		const entries: IterableIterator<number[]> = array.entries();

		sqlStatement.where(`user.id = ${entries.next()['value'][1]}`);
		for (let i: number = 1; i < array.length; ++i)
			sqlStatement.orWhere(`user.id = ${entries.next()['value'][1]}`);

		return await sqlStatement.getMany().then(async (users: User[]) => {
			for (const user of users) delete user.avatar_64;
			return users;
		}, this.lambdaDatabaseUnvailable);
	}

	async arrayIdsToUsersWithCache(array: number[], usersCached: User[]): Promise<User[] | null> {
		if (!array) return null;
		const users: User[] = new Array();
		const usersToFetch: number[] = array.filter(id => usersCached.find(u => u.id !== id));

		if (usersToFetch && usersToFetch.length > 0)
			usersCached = [...usersCached, ...(await this.arrayIdsToUsers(usersToFetch))];

		for (const [index, id] of array.entries()) {
			let cacheUser: User = usersCached.find((user: User) => user.id === id);
			if (!cacheUser)
				throw new UnprocessableEntityException(
					`Can't get user ${array} with cache ${usersCached.map(user => user.id)}.`
				);
			users.push(cacheUser);
		}
		return users;
	}
}
