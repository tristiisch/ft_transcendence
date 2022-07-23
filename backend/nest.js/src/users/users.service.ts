import { ConflictException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { User } from 'src/users/interface/user.interface';
import { CreateUserDTO } from './dto/create-user.dto';

@Injectable()
export class UsersService {
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

	getUser(id: number): User {
		let user: User = this.users.find(user => user.id == id);
		if (!user)
			throw new NotFoundException("Can't find the user n°" + id + ".");
		return user;
	}

	getUserByUsername(username: string): User {
		let user: User = this.users.find(user => user.username === username);
		if (!user)
			throw new NotFoundException("Can't find the user with username " + username + ".");
		return user;
	}

	getUserByEmail(email: string): User {
		let user: User = this.users.find(user => user.email === email);
		if (!user)
			throw new NotFoundException("Can't find the user with email " + email + ".");
		return user;
	}

	getAllUsers(): User[] {
		return this.users;
	}

	addUser(user: CreateUserDTO) {
		if (user.id < 0)
			throw new NotAcceptableException("Can't add a user with negative id " + user.id + ".");

		if (this.users.find(u => u.id == user.id))
			throw new ConflictException("They is already a user with id n°" + user.id + ".");

		if (this.users.find(u => u.username === user.username))
			throw new ConflictException("They is already a user with username " + user.username + ".");

		if (this.users.find(u => u.email === user.email))
			throw new ConflictException("They is already a user with email " + user.email + ".");

		this.users = [...this.users, user]; // Get the array users and push back the new user
	}

	// TODO check if new username/email is not already used
	updateUser(id: number, userInput: User) {
		let isUserUpdated: boolean = false;
		const userToUpdate = this.getUser(id);
		if (!userToUpdate)
			throw new NotFoundException("Can't find the user n°" + id + " to update.");

		/**
		 * This was replaced by a for loop of every field of object User to be more scalable
		 */
		/*if (userInput.hasOwnProperty('done')) // ONLY FOR BOOLEAN
		if (userInput.username && userToUpdate.username !== userInput.username) {
			userToUpdate.username = userInput.username;
			isUserUpdated = true;
		}
		if (userInput.email && userToUpdate.email !== userInput.email) {
			userToUpdate.email = userInput.email;
			isUserUpdated = true;
		}
		if (userInput.token42 && userToUpdate.token42 !== userInput.token42) {
			userToUpdate.token42 = userInput.token42;
			isUserUpdated = true;
		}

		const updatedUsers = this.users.map(t => t.id !== id ? t : userToUpdate)
		this.users = [...updatedUsers]
		return { isUserUpdated: isUserUpdated, user: userToUpdate }*/

		const userFieldsNames = Object.keys(userToUpdate)

		// Loop of every fields of type User (todoToUpdateKey will be email, username, token42 ...)
		for (let todoToUpdateKey of userFieldsNames) {
			if (todoToUpdateKey === "id")
				continue;

			// ONLY WORKS FOR UPDATE STRING FIELDS (int & boolean won't work maybe)
			if (userInput[todoToUpdateKey] && userToUpdate[todoToUpdateKey] !== userInput[todoToUpdateKey]) {
				userToUpdate[todoToUpdateKey] = userInput[todoToUpdateKey]
				isUserUpdated = true;
			}
		}
		return { isUserUpdated: isUserUpdated, user: userToUpdate }
	}

	deleteUser(id: number) {
		const usersSize = this.users.length;

		this.users = [...this.users.filter(u => u.id != id)]
		const deletedUsers = usersSize - this.users.length;
		if (deletedUsers == 0) {
			throw new NotFoundException("Can't find user to delete with id " + id + ".")
		}
		return { deletedUsers: deletedUsers };
	}
}
