# Intervu.ai DB Provider

## Description

Intervu.ai DB Implementation.

## How to used Mysql Provider
```
# Create the Database module
# Single connection database
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DbProviderSqlModule } from 'db-provider';

@Module({
  imports: [
    DbProviderSqlModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get<string>(configService.get('db.mysql.host')),
          port: configService.get<number>(configService.get('db.mysql.port')),
          database: configService.get<string>(
            configService.get('db.mysql.name'),
          ),
          username: configService.get<string>(
            configService.get('db.mysql.user'),
          ),
          password: configService.get<string>(
            configService.get('db.mysql.password'),
          ),
          autoLoadEntities: true,
          synchronize: configService.get<boolean>(
            configService.get('db.mysql.synchronize'),
          ), // never use TRUE in production!
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

# Multiple connection database
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DbProviderSqlModule } from 'db-provider';

@Module({
  imports: [
    DbProviderSqlModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          name: 'connection1',
          host: configService.get<string>(configService.get('db.mysql.host')),
          port: configService.get<number>(configService.get('db.mysql.port')),
          database: configService.get<string>(
            configService.get('db.mysql.name'),
          ),
          username: configService.get<string>(
            configService.get('db.mysql.user'),
          ),
          password: configService.get<string>(
            configService.get('db.mysql.password'),
          ),
          autoLoadEntities: true,
          synchronize: configService.get<boolean>(
            configService.get('db.mysql.synchronize'),
          ), // never use TRUE in production!
        };
      },
      name: 'connection1',
      inject: [ConfigService],
    }),
    DbProviderSqlModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          name: 'connection2',
          host: 'localhost',
          port: 3307,
          database: 'intervu',
          username: 'root',
          password: '12345',
          autoLoadEntities: true,
          synchronize: true, // never use TRUE in production!
        };
      },
      name: 'connection2',
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

# Import them in the module level
imports: [
  TypeOrmModule.forFeature([User], 'connection2'),
  TypeOrmModule.forFeature([User], 'connection1'),
],

# Using it in the service
@Injectable()
export class IamAgentService {
  constructor(
    @InjectRepository(User, 'connection2')// name of the connection to used
    private userRepository: Repository<User>,
  ) {}

  async save(user: User): Promise<User[] | ErrorType> {
    return this.userRepository.save([user]);
  }

  async findMany(): Promise<User[]> {
    return this.userRepository.find();
  }
}
```

## How to used MongoDb Provider
```
# Create the Database module
# Single connection database
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DbProviderNoSqlModule } from 'db-provider';

@Module({
  imports: [
    DbProviderNoSqlModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.get(configService.get('db.mongo.url')),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

# Multiple connection database
# Create the Database module
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DbProviderNoSqlModule } from 'db-provider';

@Module({
  imports: [
    DbProviderNoSqlModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.get(configService.get('db.mongo.url')),
        };
      },
      connection: 'connection1',
      inject: [ConfigService],
    }),
    DbProviderNoSqlModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.get(configService.get('db.mongo.url')),
        };
      },
      connection: 'connection2',
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

# Import them in the module level
TypeOrmModule.forFeature([User], 'connection2'),
  TypeOrmModule.forFeature([User], 'connection1'),
  MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }], 'connection1'),
  MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }], 'connection2'),
]

# Using it in the service
@Injectable()
export class IamAgentService {
  constructor(
    @InjectModel(UserModel.name, 'connection1') private userModel: Model<UserDocument>
  ) {}

  async save(user: User): Promise<User[] | ErrorType> {
    const userData = new UserModel()
    userData.assimilate({
      username: user.username,
      password: user.password
    })
    
    return new this.userModel(userData).save()
  }
}
```