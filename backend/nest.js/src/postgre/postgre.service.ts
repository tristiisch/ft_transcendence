import { Injectable } from '@nestjs/common';

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

    findAllUsers(): any[] {
        return this.users;
    }
}
