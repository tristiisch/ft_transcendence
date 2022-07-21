import { Injectable } from '@nestjs/common';
import { User } from 'src/users/interface/user.interface';

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
        }
    ];

    getUser(id: number): User {
        return this.users.find(user => user.id == id);
    }

    getUserByUsername(username: string): User {
        return this.users.find(user => user.username == username);
    }

    getAllUsers(): User[] {
        return this.users;
    }

    addUser(user : User) {
        this.users = [...this.users, user]; // Get the array users and push back the new user
    }
}
