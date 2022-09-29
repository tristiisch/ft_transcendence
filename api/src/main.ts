/** @prettier */
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import { FtLogger } from 'logger/ft.logger';

dotenv.config();

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { abortOnError: true, logger: new FtLogger() });
	const port = process.env.VITE_API_PORT;
	app.enableCors({ origin: [process.env.FRONT_URL, `http://localhost:${process.env.FRONT_PORT}`] });
	app.setGlobalPrefix('api');

	app.use(bodyParser.json({ limit: '100mb' }));

	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

	await app.listen(port, async () => {
		Logger.log(`API\t\t\t${process.env.VITE_API_URL}`, process.env.NAME);
		Logger.log(`API localhost\t\thttp://localhost:${process.env.VITE_API_PORT}`, process.env.NAME);
		Logger.log(`Front\t\t\t${process.env.FRONT_URL}`, process.env.NAME);
		Logger.log(`Front localhost\t\thttp://localhost:${process.env.FRONT_PORT}`, process.env.NAME);
		Logger.log(`Front Docker\t\t${process.env.FRONT_HOSTNAME_FOR_API}:${process.env.FRONT_PORT}`, process.env.NAME);
	});
}
bootstrap();
