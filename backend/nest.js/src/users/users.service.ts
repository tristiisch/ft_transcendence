import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { CreateUserDTO } from "./dto/create-user.dto";
import { User } from "./entity/user.entity";

export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private dataSource: DataSource
	) {}

	users: User[] = [
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
	];

	findAll(): Promise<User[]> {
		return this.usersRepository.find();
	}
	
	findOne(id: number): Promise<User> {
		return this.usersRepository.findOneBy({ id });
	}
	
	async remove(id: number): Promise<void> {
		await this.usersRepository.delete(id);
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
		try {
			await this.usersRepository.insert(newUser);
		} catch (err) {
			err.message;
		}
	}

	update(id: number, user: User) {
		throw new Error('Method not implemented.');
	}

	findOneByUsername(name: string): Promise<User> {
		throw new Error('Method not implemented.');
	}
}
