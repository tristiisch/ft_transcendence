import { Body, Controller, Get, Post } from '@nestjs/common';
import { User } from 'src/interface/user.interface';
import { UsersService } from './users.service';

// localhost:3000/users
@Controller('users')
export class UsersController {

    constructor(private readonly UsersService: UsersService) {}

    @Get()
    getAllUsers(): User[] {
        return this.UsersService.getAllUsers();
    }

    @Post()
    addUser(@Body() newUser) {
        console.log('new user added : ', newUser)
        this.UsersService.addUser(newUser);
    }
}
