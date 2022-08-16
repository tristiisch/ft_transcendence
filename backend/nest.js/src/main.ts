import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from "dotenv";
import { createServer } from './socket/server';
import { createClient } from './socket/client';

dotenv.config();

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const port = process.env.PORT;

	app.enableCors({origin: "http://localhost:8000"})
	// setting localhost:3000 to localhost:3000/api
	app.setGlobalPrefix('api');

	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

	await app.listen(port, () => {
		console.log('[WEB]', `http://localhost:${port}/api`);
		createServer(3001);
		createClient('localhost', 3001);
	});
}
bootstrap();