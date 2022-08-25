import {
  DynamicModule,
  FactoryProvider,
  ModuleMetadata,
  Logger,
} from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConnectOptions, connect, connection } from 'mongoose';

export const DbProviderNoSqlKey = 'DATABASE_NOSQL_CONNECTION';

type DbProviderNoSqlOptions = {
  uri: string;
  options?: ConnectOptions;
};

type DbProviderNoSqlAsyncModuleOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<DbProviderNoSqlOptions> | DbProviderNoSqlOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;

@Module({})
export class DbProviderNoSqlModule {
  static async registerAsync({
    useFactory,
    imports,
    inject,
  }: DbProviderNoSqlAsyncModuleOptions): Promise<DynamicModule> {
    const dbProvider = {
      provide: DbProviderNoSqlKey,
      useFactory: async (args: DbProviderNoSqlOptions) => {
        const { uri, options = {} } = await useFactory(args);

        connection.on('connecting', () => {
          Logger.log('nosql connecting...');
        });

        connection.on('connected', () => {
          Logger.log('nosql connected...');
        });
        return connect(uri, options);
      },
      inject,
    };

    return {
      module: DbProviderNoSqlModule,
      imports,
      providers: [dbProvider],
      exports: [dbProvider],
    };
  }
}
