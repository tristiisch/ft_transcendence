import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	/**
	 * setting localhost:3000 to localhost:3000/api
	 */
	// app.setGlobalPrefix('api');

	await app.listen(3000);
}
bootstrap();
