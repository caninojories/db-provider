import {
  DynamicModule,
  FactoryProvider,
  Logger,
  ModuleMetadata,
} from '@nestjs/common';
import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';

export const DbProviderNoSqlKey = 'DATABASE_NOSQL_CONNECTION';

type DbProviderNoSqlAsyncModuleOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<MongooseModuleFactoryOptions> | MongooseModuleFactoryOptions;
  name?: string;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;

@Module({})
export class DbProviderNoSqlModule {
  static async registerAsync({
    name,
    useFactory,
    inject,
  }: DbProviderNoSqlAsyncModuleOptions): Promise<DynamicModule> {
    return MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const data = useFactory(config);
        return {
          ...data,
          connectionFactory: (connection: Connection, name: string) => {
            /**
             * 0 = disconnected
             * 1 = connected
             * 2 = connecting
             * 3 = disconnecting
             * 99 = uninitialized
             */
            switch (connection.readyState) {
              case 0:
                Logger.warn(`${name} is disconnected`);
                break;
              case 1:
                Logger.log(`${name} is connected`);
                break;
              case 2:
                Logger.log(`${name} is connecting`);
                break;
              case 3:
                Logger.warn(`${name} is disconnecting`);
                break;
              case 99:
                Logger.warn(`${name} is uninitialized`);
                break;
              default:
                Logger.error(`${name} cannot be defined`);
            }

            connection.on('connected', () => {
              Logger.log(`${name} is connected`);
            });
            connection.on('disconnected', () => {
              Logger.warn(`${name} disconnected`);
            });
            connection.on('error', (error) => {
              Logger.error(`MongoDB ${name} error`, error);
            });

            return connection;
          },
        };
      },
      connectionName: name,
      inject,
    });
  }
}
