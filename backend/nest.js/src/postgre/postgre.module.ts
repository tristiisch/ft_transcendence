import { Module } from '@nestjs/common';
import { PostgreController } from './postgre.controller';
import { PostgreService } from './postgre.service';

@Module({
  controllers: [PostgreController],
  providers: [PostgreService]
})
export class PostgreModule {}
