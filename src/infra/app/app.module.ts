import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/nestjs';
import { getDatabaseConfigFromEnv } from '../database/typeorm';
import { AccountsModule } from '../../domains/accounts/accounts.module';
import { TransactionsModule } from '../../domains/transactions/transactions.module';
import { LedgerModule } from '../../domains/ledger/ledger.module';

@Module({
  imports: [
    DatabaseModule.forRoot(getDatabaseConfigFromEnv()),
    AccountsModule,
    TransactionsModule,
    LedgerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
