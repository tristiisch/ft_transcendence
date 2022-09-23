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
			frontFakeLogin: `${frontURL}/fakeLogin/:username`,
			addFakeData: `${backURL}/api/test/addFakeData/:username`,
			generateFakeUsers: `${backURL}/api/test/generateFakeUsers/:nb`,
			cleardb: `${backURL}/api/test/cleardb`,
			clearChat: `${backURL}/api/test/clear-chat`,
			generateChannels: `${backURL}/api/test/generateChannels/:username`,
			generateChannelsNb: `${backURL}/api/test/generateChannels/:username/:nb`,
			dev: `${backURL}/api/test/dev`
		}
	}
}
