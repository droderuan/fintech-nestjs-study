import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AccountEntity,
  AccountRepository,
  LedgerEntity,
  LedgerRepository,
  TransactionEntity,
  TransactionRepository,
} from '../typeorm/models';

@Module({})
export class RepositoryModule {
  static forRoot(): DynamicModule {
    return {
      module: RepositoryModule,
      imports: [
        TypeOrmModule.forFeature([
          AccountEntity,
          TransactionEntity,
          LedgerEntity,
        ]),
      ],
      providers: [AccountRepository, TransactionRepository, LedgerRepository],
      exports: [AccountRepository, TransactionRepository, LedgerRepository],
    };
  }
}
