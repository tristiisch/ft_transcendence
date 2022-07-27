import { BadRequestException, ConflictException, HttpException, NotAcceptableException, NotFoundException, ServiceUnavailableException, UnprocessableEntityException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, InsertResult, Repository } from "typeorm";
import { CreateUserDTO } from "./dto/create-user.dto";
import { User } from "./entity/user.entity";

export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private dataSource: DataSource
	) {}


	lambdaGetUser = (user: User) => {
		if (!user)
			throw new NotFoundException();
		return user;
	};

	lambdaDatabaseUnvailable = (reason: string) => {
		throw new ServiceUnavailableException("Database error with reason '" + reason + "'");
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

	findAll(): Promise<User[]> {
		return this.usersRepository.find().then(null, this.lambdaDatabaseUnvailable);
	}
	
	findOne(id: number): Promise<User> {
		if (id < 0) {
			throw new NotAcceptableException("Can't get a user with negative id " + id + ".");
		}
		return this.usersRepository.findOneBy({ id }).then(this.lambdaGetUser, this.lambdaDatabaseUnvailable);
	}

	findOneByUsername(name: string): Promise<User> {
		if (!name || name.length == 0) {
			throw new NotAcceptableException("Can't get a user by an empty name.");
		}
		return this.usersRepository.findOne({ where: {username : name } }).then(this.lambdaGetUser, this.lambdaDatabaseUnvailable);
	}

	findOneByEmail(email: string): Promise<User> {
		if (!email || email.length == 0) {
			throw new NotAcceptableException("Can't get a user by an empty email.");
		}
		return this.usersRepository.findOne({ where: {email : email } }).then(this.lambdaGetUser, this.lambdaDatabaseUnvailable);
	}
	
	async remove(id: number): Promise<void> {
		return await this.usersRepository.delete(id).then(null, this.lambdaDatabaseUnvailable);
	}

	async saveMany(users: User[]) {
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
	}

	async add(newUser: User) {
		const sql = this.usersRepository.createQueryBuilder("user").where("user.id = :id", { id: newUser.id }).orWhere("user.username = :username", { username: newUser.username }).orWhere("user.email = :email", { email: newUser.email });

		
		//console.log("SQL", sql.getQueryAndParameters());
		await sql.getOne().then((checkUserExist: User) => {
			if (checkUserExist)
				throw new ConflictException("User " + checkUserExist.username + " already exist with same id, email or username.");
		}, this.lambdaDatabaseUnvailable);

		// Same as before but with 3 requests SQL
		/*if (newUser.id) {
			try {
				if (this.findOne(newUser.id)) {
					throw new ConflictException("A user with id '" + newUser.id + "' already exist");
				}
			} catch (err) {
				if (err instanceof ServiceUnavailableException || !(err instanceof NotFoundException)) {
					return err;
				}
			}
		}
		try {
			if (this.findOneByUsername(newUser.username)) {
				throw new ConflictException("A user with username '" + newUser.username + "' already exist");
			}
		} catch (err) {
			if (err instanceof ServiceUnavailableException || !(err instanceof NotFoundException)) {
				return err;
			}
		}
		try {
			if (this.findOneByEmail(newUser.email)) {
				throw new ConflictException("A user with email '" + newUser.email + "' already exist");
			}
		} catch (err) {
			if (err instanceof ServiceUnavailableException || !(err instanceof NotFoundException)) {
				return err;
			}
		}*/
		return await this.usersRepository.insert(newUser).then((insertResult: InsertResult) => {
			console.log('new user add : ', newUser)
			return newUser;
		}, this.lambdaDatabaseUnvailable);
	}

	update(id: number, user: CreateUserDTO) {
		return this.usersRepository.save(user);
	}
}
