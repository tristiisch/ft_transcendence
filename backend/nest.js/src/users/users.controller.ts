import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { User } from 'src/users/interface/user.interface';
import { UsersService } from './users.service';

// localhost:3000/users
@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) {}

    // localhost:3000/users/name/<name>
    @Get('name/:name')
    getUserByUsername(@Param('name') name: string): User {
        return this.usersService.getUserByUsername(name);
    }

    // localhost:3000/users/<id>
    @Get(':id')
    getUser(@Param('id') id: number): User {
        return this.usersService.getUser(id);
    }

    // localhost:3000/users
    @Get()
    getAllUsers(): User[] {
        return this.usersService.getAllUsers();
    }

    // localhost:3000/users
    @Post()
    addUser(@Body() newUser) {
        console.log('new user added : ', newUser)
        this.usersService.addUser(newUser);
    }
}
