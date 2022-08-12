// Need to set it dynamic https://docs.nestjs.com/modules

import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Module({
	providers: [DatabaseService]
})
export class DatabaseModule {}
