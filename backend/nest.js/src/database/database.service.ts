import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Channel } from 'src/chat/entity/channel.entity';
import { User } from 'src/users/entity/user.entity';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
	@Inject(ConfigService)
	private readonly config: ConfigService;
  
	public createTypeOrmOptions(): TypeOrmModuleOptions {
		return {
			type: 'postgres',
			host: this.config.get<string>('DATABASE_HOST'),
			port: this.config.get<number>('DATABASE_PORT'),
			database: this.config.get<string>('DATABASE_NAME'),
			username: this.config.get<string>('DATABASE_USER'),
			password: this.config.get<string>('DATABASE_PASSWORD'),
			// entities: ['dist/**/**/*.entity.{ts,js}'],
			entities: [User, Channel],
			// migrations: ['dist/migrations/*.{ts,js}'],
			// migrationsTableName: 'typeorm_migrations',
			logger: 'file',
			autoLoadEntities: true,
			// TypeORM should update any changes of your entities automatically ?
			synchronize: true,
		};
	}
}
