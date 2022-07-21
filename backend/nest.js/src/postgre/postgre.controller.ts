import { Body, Controller, Get, Post } from '@nestjs/common';
import { User } from 'src/interface/user.interface';
import { PostgreService } from './postgre.service';

// localhost:3000/postgre
@Controller('postgre')
export class PostgreController {

    constructor(private readonly postgreService: PostgreService) {}

    @Get()
    findAllUsers(): User[] {
        return this.postgreService.findAllUsers();
    }

    @Post()
    addUser(@Body() newUser) {
        console.log('new user added : ', newUser)
        this.postgreService.addUser(newUser);
    }
}
