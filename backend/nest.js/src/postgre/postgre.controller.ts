import { Controller, Get } from '@nestjs/common';
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
}
