import {
  Module,
  DynamicModule,
  FactoryProvider,
  ModuleMetadata,
} from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

export const DbProviderSqlKey = 'DATABASE_SQL_CONNECTION';

type DbProviderSqlOptions = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
} & Partial<TypeOrmModuleOptions>;

type DbProviderSqlAsyncModuleOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<DbProviderSqlOptions> | DbProviderSqlOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;

@Module({})
export class DbProviderSqlModule {
  static async registerAsync({
    useFactory,
    imports,
    inject,
  }: DbProviderSqlAsyncModuleOptions): Promise<DynamicModule> {
    const dbProvider = {
      provide: DbProviderSqlKey,
      useFactory: async (args: DbProviderSqlOptions) => {
        const {
          host,
          port,
          database,
          username,
          password,
          autoLoadEntities,
          synchronize = false,
        } = await useFactory(args);

        return TypeOrmModule.forRootAsync({
          useFactory: async () => {
            return {
              type: 'mysql',
              host: host,
              port: port,
              database: database,
              username: username,
              password: password,
              autoLoadEntities: autoLoadEntities,
              synchronize: synchronize,
            };
          },
          dataSourceFactory: async (options: DataSourceOptions | undefined) => {
            const dataSource = await new DataSource(options as DataSourceOptions).initialize();
            return dataSource;
          },
        });
      },
      inject,
    };

    return {
      module: DbProviderSqlModule,
      imports,
      providers: [dbProvider],
      exports: [dbProvider],
    };
  }
}
