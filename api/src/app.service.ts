/** @prettier */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

	getHello(): string {
		return `Welcome at ${process.env.NAME}. Some useful GET requests to control the api:\n`
			+ `${process.env.API_URL}/addFakeData/:username\n`
			+ `${process.env.API_URL}/generateFakeUsers/:username\n`
			+ `${process.env.API_URL}/cleardb\n`
			+ `${process.env.API_URL}/clear-chat\n`
			+ `${process.env.API_URL}/generateChannels/:username\n`
			+ `${process.env.API_URL}/generateChannels/:username/:nb\n`
	}
}
