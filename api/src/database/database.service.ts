/** @prettier */
import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserAuthSubscriber } from 'auth/entity/auth.subscriber';
import { UserSubscriber } from 'users/entity/user.subscriber';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
	public createTypeOrmOptions(): TypeOrmModuleOptions {
		return {
			type: 'postgres',
			host: process.env.DATABASE_HOST,
			port: parseInt(process.env.DATABASE_PORT),
			database: process.env.DATABASE_NAME,
			username: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			logger: 'file',
			autoLoadEntities: true,
			synchronize: true,
			subscribers: [UserSubscriber, UserAuthSubscriber],
		};
	}
}
