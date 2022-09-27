import { ConsoleLogger, Injectable, Logger, LoggerService } from '@nestjs/common';

@Injectable()
export class FtLogger extends ConsoleLogger implements LoggerService {

	error(message: any, ...optionalParams: [...any, string?, string?]): void {
		//Logger.verbose(`optionalParams ${JSON.stringify(optionalParams)}`)
		super.error(message, ...optionalParams);
	}

	warn(message: any, ...optionalParams: [...any, string?]): void {
		//Logger.verbose(`optionalParams ${JSON.stringify(optionalParams)}`)
		super.warn(message, ...optionalParams);
	}

	log(message: string, ...optionalParams: [...any, string?]) {
		const context = optionalParams[0];
		if (context === 'WebSocketsController' || context === 'RouterExplorer'
			|| context === 'RoutesResolver' || context === 'InstanceLoader') {
			return;
		}
		if (context === 'NestFactory' || context === 'NestApplication') {
			message = message.replace('Nest application', `${process.env.NAME}_api`)
		}
		// console.log('debug', context, message)
		super.log(message, ...optionalParams);
	}

	debug(message: any, ...optionalParams: [...any, string?]): void {
		// Logger.verbose(`optionalParams ${JSON.stringify(optionalParams)}`)
		super.debug(message, ...optionalParams);
	}

	verbose(message: any, ...optionalParams: [...any, string?]): void {
		// Logger.verbose(`optionalParams ${JSON.stringify(optionalParams)}`)
		super.verbose(message, ...optionalParams);
	}
}
