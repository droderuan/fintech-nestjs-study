import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AccountEntity,
  AccountRepository,
  LedgerEntity,
  LedgerRepository,
  TransactionEntity,
  TransactionRepository,
  TransactionStatusEntity,
  TransactionStatusRepository,
  TransactionTypeEntity,
  TransactionTypeRepository,
} from '../typeorm/models';

const repositories = [
  AccountRepository,
  TransactionTypeRepository,
  TransactionStatusRepository,
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
          TransactionStatusEntity,
          TransactionEntity,
          LedgerEntity,
        ]),
      ],
      providers: repositories,
      exports: repositories,
    };
  }
}
