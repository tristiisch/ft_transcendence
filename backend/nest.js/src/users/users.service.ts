import { ConflictException, NotFoundException, PreconditionFailedException, ServiceUnavailableException, NotAcceptableException, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, DeleteResult, InsertResult, Repository } from "typeorm";
import { UserDTO } from "./entity/user.dto";
import { User } from "./entity/user.entity";
import * as _ from "lodash";

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
			throw new PreconditionFailedException("Can't get a user with negative id " + id + ".");
		}
		return this.usersRepository.findOneBy({ id }).then(this.lambdaGetUser, this.lambdaDatabaseUnvailable);
	}

	findOneByUsername(name: string): Promise<User> {
		if (!name || name.length == 0) {
			throw new PreconditionFailedException("Can't get a user by an empty name.");
		}
		return this.usersRepository.findOne({ where: {username : name } }).then(this.lambdaGetUser, this.lambdaDatabaseUnvailable);
	}

	findOneByEmail(email: string): Promise<User> {
		if (!email || email.length == 0) {
			throw new PreconditionFailedException("Can't get a user by an empty email.");
		}
		return this.usersRepository.findOne({ where: {email : email } }).then(this.lambdaGetUser, this.lambdaDatabaseUnvailable);
	}
	
	async remove(id: number) {
		if (id < 0) {
			throw new PreconditionFailedException("Can't remove a user with negative id " + id + ".");
		}
		return await this.usersRepository.delete(id).then((value: DeleteResult) => {
			if (!value.affected || value.affected == 0) {
				throw new NotFoundException();
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
		const sqlStatermentCheckIfExist = this.usersRepository.createQueryBuilder("user").where("user.id = :id", { id: newUser.id })
			.orWhere("user.username = :username", { username: newUser.username })
			.orWhere("user.email = :email", { email: newUser.email });
		
		//console.log("SQL", sql.getQueryAndParameters());
		await sqlStatermentCheckIfExist.getOne().then((checkUserExist: User) => {
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
		return await this.usersRepository.insert(newUser).then((insertResult: InsertResult) => { // This didn't use anotations check of User or UserDTO !!
			if (insertResult.identifiers.length < 1) {
				throw new InternalServerErrorException("Can't add user " + newUser.username);
			} else if (insertResult.identifiers.length > 1) {
				throw new InternalServerErrorException(insertResult.identifiers.length + " rows was modify instead of one");
			}
			console.log('new user added : ', newUser)
			return newUser;
		}, this.lambdaDatabaseUnvailable);
	}

	async update(userId: number, user: UserDTO) {
		let userBefore = await this.findOne(userId);
		await this.usersRepository.update(userId, user);
		let userAfter = await this.findOne(userId);

		if (_.isEqual(userBefore, userAfter)) {
			return { statusCode: "200", message: "Nothing change."}
		}
		return userAfter;
	}

	async getFriendsIds(userId: number): Promise<number[]> {
		let user: User = await this.findOne(userId);
		return user.friends;
	}

	async getFriends(userId: number): Promise<User[]>  {
		return await Promise.all((await this.getFriendsIds(userId)).map(async (friendId) => {
			return (await this.findOne(friendId))
		}));
	}

	async getFriendsNames(userId: number): Promise<string[]> {
		return (await this.getFriends(userId)).map(friend => friend.username);
	}

	async addFriend(userId: number, targetId: number) {
		let user: User = await this.findOne(userId);
		let target: User = await this.findOne(targetId);

		let userFriends: number[], targetFriends: number[];
		if (user.friends != null) {
			userFriends = user.friends;
			if (userFriends.includes(target.id)) {
				throw new NotAcceptableException(user.username + " is already friend with " + target.username);
			}
		} else
			userFriends = new Array<number>();

		if (target.friends != null) {
			targetFriends = target.friends;
			if (targetFriends.includes(user.id)) {
				throw new NotAcceptableException(target.username + " is already friend with " + user.username);
			}
		}
		else
			targetFriends = new Array<number>();

		userFriends.push(target.id);
		targetFriends.push(user.id);

		let isAffected: boolean = await this.usersRepository.update({id: user.id} , { friends: userFriends }).then(res => res.affected == 1, this.lambdaDatabaseUnvailable);
		if (isAffected) {
			isAffected = await this.usersRepository.update({id: target.id}, { friends: targetFriends }).then(res => res.affected == 1, reason => false);
			if (isAffected)
				return { statusCode: 200, message: user.username + " and " + target.username + " are now friends." };
			else {
				userFriends.splice(userFriends.indexOf(target.id), 1);
				isAffected = await this.usersRepository.update({id: user.id} , { friends: userFriends }).then(res => res.affected == 1, this.lambdaDatabaseUnvailable);
				if (!isAffected) {
					throw new NotAcceptableException(user.username + " is now friend with " + target.username + " but " + target.username + " is not friend with " + target.username);
				}
			}
		} else {
			throw new NotAcceptableException("Can't make " + user.username + " and " + target.username + " friends.");
		}
	}
}
