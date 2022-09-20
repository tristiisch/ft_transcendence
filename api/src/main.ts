/** @prettier */
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { createSocketServer } from './socket/server';
import { createClient } from './socket/client';
import * as bodyParser from 'body-parser';
import { FtLogger } from 'logger/ft.logger';

dotenv.config();

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { logger: new FtLogger() });
	const port = process.env.API_PORT;
	app.enableCors({ origin: `${process.env.FRONT_URL}` });
	app.setGlobalPrefix('api');

	// For avatar, max JSON (should be better if this rules is only for avatar request)
	app.use(bodyParser.json({ limit: '10mb' }));

	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

	await app.listen(port, async () => {
		console.log('API\t\t', `${process.env.API_URL}`);
		console.log('API NETWORK\t', `http://${process.env.LOCAL_HOSTNAME}:${process.env.API_PORT}`);
		console.log('FRONT\t\t', `${process.env.FRONT_URL}`);
		console.log('FRONT NETWORK\t', `http://${process.env.LOCAL_HOSTNAME}:${process.env.FRONT_PORT}`);
		console.log('FRONT DOCKER\t', `${process.env.FRONT_HOSTNAME_FOR_API}:${process.env.FRONT_PORT}`);
		//createSocketServer(3001);
	});
}
bootstrap();
