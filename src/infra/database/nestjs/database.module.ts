import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource, DatabaseConfig } from '../typeorm/dataSource';
import { DatabaseService } from './database.service';
import { RepositoryModule } from './repository.module';

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(config: DatabaseConfig): DynamicModule {
    const dataSource = AppDataSource.initialize(config);

    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
            ...dataSource.options,
            autoLoadEntities: true,
          }),
        }),
        RepositoryModule.forRoot(),
      ],
      providers: [
        DatabaseService,
        {
          provide: 'DATABASE_CONFIG',
          useValue: config,
        },
      ],
      exports: [DatabaseService, TypeOrmModule, RepositoryModule],
    };
  }
}
