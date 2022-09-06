import { ConflictException, NotFoundException, PreconditionFailedException, ServiceUnavailableException, NotAcceptableException, InternalServerErrorException, Injectable, BadRequestException, Res } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { toBase64, isNumberPositive, fromBase64 } from "../utils/utils";
import { DataSource, DeleteResult, InsertResult, Repository, SelectQueryBuilder, UpdateResult } from "typeorm";
import { UserSelectDTO } from "./entity/user-select.dto";
import { UserDTO } from "./entity/user.dto";
import { User } from "./entity/user.entity";
import { Response } from 'express';

@Injectable()
export class UsersService {

	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		// private dataSource: DataSource
	) {}

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
		try {
			return await this.usersRepository.find();
		} catch (reason) {
			return this.lambdaDatabaseUnvailable(reason);
		}
	}

	async findOne(id: number): Promise<User> {
		isNumberPositive(id, 'get a user');
		return await this.usersRepository.findOneBy({ id }).then((user: User) => this.lambdaGetUser(user, id), this.lambdaDatabaseUnvailable);
	}

	// async findOneAvatar(id: number): Promise<User> {
	// 	isNumberPositive(id, "get a user's avatar");
	// 	return await this.usersRepository.findOneBy({ id }).then((user: User) => {
	// 		if (!user)
	// 			throw new NotFoundException(`The user '${id}' does not exist.`);
	// 		// user.setAvatar();
	// 		return user;
	// 	}, this.lambdaDatabaseUnvailable);
	// }

	async findOneByUsername(name: string): Promise<User> {
		if (!name || name.length == 0) {
			throw new PreconditionFailedException("Can't get a user by an empty name.");
		}
		return await this.usersRepository.findOne({ where: {username : name }}).then((user: User) => {
			return this.lambdaGetUser(user, name);
		}, this.lambdaDatabaseUnvailable);
	}

	// async findOneAvatarByUsername(name: string): Promise<User> {
	// 	if (!name || name.length == 0) {
	// 		throw new PreconditionFailedException("Can't get a user's avatar by an empty name.");
	// 	}
	// 	return await this.usersRepository.findOne({ where: {username : name }}).then((user: User) => {
	// 		if (!user)
	// 			throw new NotFoundException(`The user '${name}' does not exist.`);
	// 		// user.setAvatar();
	// 		return user;
	// 	}, this.lambdaDatabaseUnvailable);
	// }

	async findOneBy42Login(login42: string): Promise<User> {
		if (!login42 || login42.length == 0) {
			throw new PreconditionFailedException("Can't get a user by an empty 42login.");
		}
		return await this.usersRepository.findOne({ where: { login_42: login42 } }).then((user: User) => {
			return this.lambdaGetUser(user, login42);
		}, this.lambdaDatabaseUnvailable);
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

	/*async saveMany(users: User[]) {
		const queryRunner = this.dataSource.createQueryRunner();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			users.map(async u => await queryRunner.manager.save(u))

			await queryRunner.commitTransaction();
		} catch (err) {
			// since we have errors lets rollback the changes we made
			await queryRunner.rollbackTransaction();
		} finally {
			// you need to release a queryRunner which was manually instantiated
			await queryRunner.release();
		}
	}*/

	async add(newUser: User): Promise<User> {
		const sqlStatement: SelectQueryBuilder<User> = this.usersRepository.createQueryBuilder("user")
			.where("user.id = :id", { id: newUser.id })
			.orWhere("user.username = :username", { username: newUser.username });

		//console.log("SQL", sql.getQueryAndParameters());
		await sqlStatement.getOne().then((checkUserExist: User) => {
			if (checkUserExist)
				throw new ConflictException(`User ${checkUserExist.username} already exist with same id, email or username.`); // TODO Change msg for client
		}, this.lambdaDatabaseUnvailable);

		return await this.usersRepository.insert(newUser).then((insertResult: InsertResult) => { // This didn't use anotations check of User or UserDTO !!
			if (insertResult.identifiers.length < 1) {
				throw new InternalServerErrorException(`Can't add user ${newUser.username}.`);
			} else if (insertResult.identifiers.length > 1) {
				throw new InternalServerErrorException(insertResult.identifiers.length + " rows was modify instead of one.");
			}
			// console.log('new user added : ', newUser)
			return newUser;
		}, this.lambdaDatabaseUnvailable);
	}

	async updateUsername(userId: number, username: string): Promise<User> {
		await this.usersRepository.update(userId, { username: username });
		return await this.findOne(userId);
	}

	async updateAvatar(userId: number, avatar_64: string): Promise<User> {
		await this.usersRepository.update(userId, { avatar_64: avatar_64 });
		return await this.findOne(userId);
	}

	async register(userId: number, user: UserDTO) {
		const userBefore: User = await this.findOne(userId);
		if (userBefore.username !== null)
			throw new BadRequestException(`User ${userBefore.username} already register.`);

		if (user.avatar_64 != null) {
			try {
				user.avatar_64 = await toBase64(user.avatar_64);
				this.usersRepository.update(userId, { avatar_64: user.avatar_64, username: user.username });
			} catch (err) {
				console.log('ERROR', 'user.service.ts avatar', err);
			}
		} else {
			this.usersRepository.update(userId, { username: user.username });
		}
		return await this.findOne(userId);
	}

	async findAvatar(selectUser: UserSelectDTO, @Res() res: Response) {
		let target: User;
		if (selectUser.id != null)
			target = await this.usersRepository.findOneBy({ id: selectUser.id });
		else if (selectUser.username != null)
			target = await this.usersRepository.findOneBy({ username: selectUser.username });
		else
			throw new NotAcceptableException("Unable to find a user without key 'id' or 'username'.");

		const avatar: { imageType: any; imageBuffer: any; } = fromBase64(target.avatar_64);

		res.writeHead(200, { 'Content-Type': avatar.imageType, 'Content-Length': avatar.imageBuffer.length });
		res.end(avatar.imageBuffer);
	}

	async arrayIdsToUsers(array: number[]): Promise<User[]> {
		const users: User[] = new Array();
		for (const [index, id] of array.entries()) {
			users.push(await this.findOne(id));
		}
		return users;
	}
}
