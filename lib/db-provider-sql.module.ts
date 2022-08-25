import {
  Module,
  DynamicModule,
  FactoryProvider,
  ModuleMetadata,
} from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

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
    inject,
  }: DbProviderSqlAsyncModuleOptions): Promise<DynamicModule> {
    return TypeOrmModule.forRootAsync({
      useFactory,
      dataSourceFactory: async (options: DataSourceOptions | undefined) => {
        const dataSource = await new DataSource(
          options as DataSourceOptions,
        ).initialize();
        return dataSource;
      },
      inject,
    });
  }
}
