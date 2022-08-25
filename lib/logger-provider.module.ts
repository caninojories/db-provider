import { LoggerService } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import ecsFormat = require('@elastic/ecs-winston-format');

export class LoggerProviderModule {
  static register(): LoggerService {
    return WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(ecsFormat({ convertReqRes: true })),
          level: 'info',
        }),
      ],
    });
  }
}
