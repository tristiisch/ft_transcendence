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
			// entities: ['dist/**/**/*.entity.{ts,js}'],
			// entities: [User, Channel],
			// migrations: ['dist/migrations/*.{ts,js}'],
			// migrationsTableName: 'typeorm_migrations',
			logger: 'file',
			autoLoadEntities: true,
			// TypeORM should update any changes of your entities automatically ?
			synchronize: true,
			subscribers: [UserSubscriber, UserAuthSubscriber],
		};
	}
}
