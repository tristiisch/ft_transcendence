import { Injectable } from '@nestjs/common';
import { User } from 'src/interface/user.interface';

@Injectable()
export class PostgreService {
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

    findAllUsers(): User[] {
        return this.users;
    }
}
