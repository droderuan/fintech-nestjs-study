import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/nestjs';
import { getDatabaseConfigFromEnv } from '../database/typeorm';
import { AccountsModule } from '../../domains/accounts/accounts.module';
import { TransactionsModule } from '../../domains/transactions/transactions.module';

@Module({
  imports: [
    DatabaseModule.forRoot(getDatabaseConfigFromEnv()),
    AccountsModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
