import { DynamicModule, FactoryProvider, ModuleMetadata } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConnectOptions } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';

export const DbProviderNoSqlKey = 'DATABASE_NOSQL_CONNECTION';

type DbProviderNoSqlOptions = {
  uri: string;
  options?: ConnectOptions;
};

type DbProviderNoSqlAsyncModuleOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<DbProviderNoSqlOptions> | DbProviderNoSqlOptions;
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
      useFactory,
      connectionName: name,
      inject,
    });
  }
}
