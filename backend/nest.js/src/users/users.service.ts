import { Injectable } from '@nestjs/common';
import { User } from 'src/interface/user.interface';

@Injectable()
export class UsersService {
    users = [
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

    getAllUsers(): User[] {
        return this.users;
    }

    addUser(user : User) {
        this.users = [...this.users, user]; // Get the array users and push back the new user
    }
}
