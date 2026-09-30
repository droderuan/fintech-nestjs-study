import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AccountEntity,
  AccountRepository,
  LedgerEntity,
  LedgerRepository,
  TransactionEntity,
  TransactionRepository,
  SystemAccountEntity,
  SystemAccountRepository,
  TransactionTypeEntity,
  TransactionTypeRepository,
} from '../typeorm/models';

const repositories = [
  AccountRepository,
  TransactionTypeRepository,
  SystemAccountRepository,
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
          TransactionTypeEntity,
          SystemAccountEntity,
          TransactionEntity,
          LedgerEntity,
        ]),
      ],
      providers: repositories,
      exports: repositories,
    };
  }
}
