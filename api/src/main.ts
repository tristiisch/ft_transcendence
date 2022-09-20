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
		Logger.log(`API\t\t${process.env.API_URL}`, process.env.NAME);
		Logger.log(`API Network\thttp://${process.env.LOCAL_HOSTNAME}:${process.env.API_PORT}`, process.env.NAME);
		Logger.log(`Front\t\t${process.env.FRONT_URL}`, process.env.NAME);
		Logger.log(`Front Network\thttp://${process.env.LOCAL_HOSTNAME}:${process.env.FRONT_PORT}`, process.env.NAME);
		Logger.log(`Front Docker\t${process.env.FRONT_HOSTNAME_FOR_API}:${process.env.FRONT_PORT}`, process.env.NAME);
		//createSocketServer(3001);
	});
}
bootstrap();
