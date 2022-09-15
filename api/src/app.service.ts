/** @prettier */
import { Injectable } from '@nestjs/common';
import { getBackRelativeURL, getFrontRelativeURL } from './utils/utils';

@Injectable()
export class AppService {

	getHello(req: any): any {
		const backURL = getBackRelativeURL(req);
		const frontURL = getFrontRelativeURL(req);
		return { message: `Welcome at ${process.env.NAME}. Some useful GET requests to control the api:`,
			front: `${frontURL}`,
			addFakeData: `${backURL}/addFakeData/:username`,
			generateFakeUsers: `${backURL}/generateFakeUsers/:username`,
			cleardb: `${backURL}/cleardb`,
			clearChat: `${backURL}/clear-chat`,
			generateChannels: `${backURL}/generateChannels/:username`,
			generateChannelsNb: `${backURL}/generateChannels/:username/:nb` }
	}
}
