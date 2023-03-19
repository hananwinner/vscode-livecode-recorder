import * as winston from 'winston';
import {JsonOptions} from 'logform';

export const logger = winston.createLogger({
	level: 'debug',
	format: winston.format.prettyPrint({ depth: 2 }),
	defaultMeta: { service: 'user-service' },
	transports: [
	  //
	  // - Write all logs with importance level of `error` or less to `error.log`
	  // - Write all logs with importance level of `info` or less to `combined.log`
	  //
	//   new winston.transports.File({ filename: 'error.log', level: 'error' }),
	  new winston.transports.File({ filename: 'debug.log', level: 'debug'}),
		new winston.transports.Console({format: winston.format.simple(),})
	],
  });