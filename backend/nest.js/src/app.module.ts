import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database/database.service';
import { ChatModule } from './chat/chat.module';
import { resolve } from 'path';

@Module({
	imports: [
		UsersModule,
		DatabaseModule,
		ConfigModule.forRoot({ envFilePath: resolve(`${__dirname}/.env`), isGlobal: true }),
		TypeOrmModule.forRootAsync({ useClass: DatabaseService }),
		ChatModule
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
