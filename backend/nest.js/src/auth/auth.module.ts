import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FtStrategy } from './strategy';
import * as dotenv from "dotenv";
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuth } from './entity/user-auth.entity';

dotenv.config();

@Module({

	imports: [JwtModule, JwtModule.register({secret: process.env.FT_SECRET,}), UsersModule, TypeOrmModule.forFeature([UserAuth])],
	providers: [AuthService, FtStrategy],
	controllers: [AuthController],
})
export class AuthModule {}
