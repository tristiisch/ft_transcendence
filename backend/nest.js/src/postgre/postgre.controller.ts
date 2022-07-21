import { Controller, Get } from '@nestjs/common';
import { PostgreService } from './postgre.service';

// localhost:3000/postgre
@Controller('postgre')
export class PostgreController {

    constructor(private readonly postgreService: PostgreService) {}

    @Get()
    findAllUsers(): any[] {
        return this.postgreService.findAllUsers();
    }
}
