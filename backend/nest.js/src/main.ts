/** @prettier */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { createSocketServer } from './socket/server';
import { createClient } from './socket/client';
import * as bodyParser from 'body-parser';

dotenv.config();

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const port = process.env.PORT;

	app.enableCors({ origin: 'http://localhost:8000' });
	// setting localhost:3000 to localhost:3000/api
	app.setGlobalPrefix('api');

	// For avatar, max JSON to 50mb (should be better if this rules is only for avatar request)
	app.use(bodyParser.json({ limit: '50mb' }));

	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

	await app.listen(port, async () => {
		console.log('[WEB]', `http://localhost:${port}/api`);
		createSocketServer(3001);
		// createClient('localhost', 3001);
	});
}
bootstrap();
