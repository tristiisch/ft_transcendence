import { ConsoleLogger, Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class FtLogger extends ConsoleLogger implements LoggerService {

	log(message: string, context?: string) {
		if (context === 'WebSocketsController' || context === 'RouterExplorer'
			|| context === 'RoutesResolver' || context === 'InstanceLoader') {
			return;
		}
		if (context === 'NestFactory' || context === 'NestApplication') {
			message = message.replace('Nest application', `${process.env.NAME}_api`)
		}
		// console.log('debug', context, message)
		super.log(message, context);
	}
}
