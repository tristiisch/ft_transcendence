import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController, TFAController } from './auth.controller';
import { JwtStrategy, JwtTFAStrategy } from './strategy';
import * as dotenv from "dotenv";
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuth } from './entity/user-auth.entity';
import { StatsModule } from 'src/game/stats/stats.module';

dotenv.config();

@Module({
	imports: [JwtModule, JwtModule.register({ secret: process.env.JWT_SECRET }), UsersModule, TypeOrmModule.forFeature([UserAuth]), StatsModule],
	providers: [AuthService, JwtStrategy, JwtTFAStrategy],
	controllers: [AuthController, TFAController],
	exports: [AuthService]
})
export class AuthModule {}
