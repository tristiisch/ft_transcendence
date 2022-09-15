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
	const port = process.env.API_PORT;
	app.enableCors({ origin: `${process.env.FRONT_URL}` });
	app.setGlobalPrefix('api');

	// For avatar, max JSON (should be better if this rules is only for avatar request)
	app.use(bodyParser.json({ limit: '10mb' }));

	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

	await app.listen(port, async () => {
		console.log('[WEB]', `${process.env.API_URL}`);
		//createSocketServer(3001);
	});
}
bootstrap();
