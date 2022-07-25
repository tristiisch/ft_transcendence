import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { getEnvPath } from './utils/env';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database/database.service';

const envFilePath: string = getEnvPath(`${__dirname}`);

@Module({
	imports: [
		UsersModule,
		DatabaseModule,
		ConfigModule.forRoot({ envFilePath, isGlobal: true }),
		TypeOrmModule.forRootAsync({ useClass: DatabaseService })
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
