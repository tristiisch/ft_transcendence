import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FtStrategy } from './strategy';
import * as dotenv from "dotenv";
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

dotenv.config();

@Module({

	imports: [JwtModule, JwtModule.register({secret: process.env.FT_SECRET,}), UsersModule],
	providers: [AuthService, FtStrategy],
	controllers: [AuthController],
})
export class AuthModule {}
