import { ConflictException, NotFoundException, PreconditionFailedException, ServiceUnavailableException, NotAcceptableException, InternalServerErrorException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isEquals } from "src/utils/entityutils";
import { DataSource, DeleteResult, InsertResult, Repository, SelectQueryBuilder } from "typeorm";
import { UserDTO } from "./entity/user.dto";
import { User } from "./entity/user.entity";

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
			throw new NotFoundException("The user '" + identifier + "' does not exist.");
		return user;
	};

	lambdaDatabaseUnvailable = (reason: string) => {
		throw new ServiceUnavailableException("Database error with reason '" + reason + "'.");
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
		if (id < 0) {
			throw new PreconditionFailedException("Can't get a user with negative id " + id + ".");
		}
		return await this.usersRepository.findOneBy({ id }).then((user: User) => this.lambdaGetUser(user, id), this.lambdaDatabaseUnvailable);
	}

	async findOneByUsername(name: string): Promise<User> {
		if (!name || name.length == 0) {
			throw new PreconditionFailedException("Can't get a user by an empty name.");
		}
		return await this.usersRepository.findOne({ where: {username : name } }).then((user: User) => this.lambdaGetUser(user, name), this.lambdaDatabaseUnvailable);
	}

	async remove(id: number) {
		if (id < 0) {
			throw new PreconditionFailedException("Can't remove a user with negative id " + id + ".");
		}
		return await this.usersRepository.delete(id).then((value: DeleteResult) => {
			if (!value.affected || value.affected == 0) {
				throw new NotFoundException("The user " + id + " does not exist.");
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
				throw new ConflictException("User " + checkUserExist.username + " already exist with same id, email or username.");
		}, this.lambdaDatabaseUnvailable);

		return await this.usersRepository.insert(newUser).then((insertResult: InsertResult) => { // This didn't use anotations check of User or UserDTO !!
			if (insertResult.identifiers.length < 1) {
				throw new InternalServerErrorException("Can't add user " + newUser.username + ".");
			} else if (insertResult.identifiers.length > 1) {
				throw new InternalServerErrorException(insertResult.identifiers.length + " rows was modify instead of one.");
			}
			console.log('new user added : ', newUser)
			return newUser;
		}, this.lambdaDatabaseUnvailable);
	}

	async update(userId: number, user: UserDTO) {
		const userBefore: User = await this.findOne(userId);
		await this.usersRepository.update(userId, user);
		const userAfter: User = await this.findOne(userId);

		if (isEquals(userBefore, userAfter)) {
			return { statusCode: 200, message: "Nothing change."}
		}
		return userAfter;
	}
}
