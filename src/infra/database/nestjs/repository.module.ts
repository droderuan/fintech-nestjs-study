import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AccountEntity,
  AccountRepository,
  LedgerEntity,
  LedgerRepository,
  SystemAccountEntity,
  TransactionEntity,
  TransactionRepository,
  TransactionTypeEntity,
} from '../typeorm/models';

const repositories = [
  AccountRepository,
  TransactionRepository,
  LedgerRepository,
];

@Module({})
export class RepositoryModule {
  static forRoot(): DynamicModule {
    return {
      module: RepositoryModule,
      imports: [
        TypeOrmModule.forFeature([
          AccountEntity,
          SystemAccountEntity,
          TransactionTypeEntity,
          TransactionEntity,
          LedgerEntity,
        ]),
      ],
      providers: repositories,
      exports: repositories,
    };
  }
}
