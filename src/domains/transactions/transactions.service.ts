import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AccountRepository,
  LedgerRepository,
  TransactionRepository,
  TransactionEntity,
} from '../../infra/database/typeorm/models';
import { CreateTransactionDto } from './dto/createTransaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly ledgerRepository: LedgerRepository,
  ) {}

  create({ account_id, type, amount }: CreateTransactionDto) {
    return this.dataSource.transaction(async (manager) => {
      const account = await this.accountRepository.findByIdForTransaction(
        account_id,
        manager,
      );
      if (!account) {
        throw new NotFoundException('Account not found');
      }

      const systemAccount =
        await this.accountRepository.findSystemAccount(manager);

      if (!systemAccount) {
        throw new InternalServerErrorException('System account not configured');
      }

      if (systemAccount.id === account.id) {
        throw new BadRequestException(
          'Transactions cannot be created for the system account',
        );
      }

      const transactionType = await this.transactionRepository.findTypeByCode(
        type,
        manager,
      );

      if (!transactionType) {
        throw new BadRequestException(`Unknown transaction type: ${type}`);
      }

      const transaction = TransactionEntity.open({
        accountId: account.id,
        transactionType,
        amount,
      });

      if (transaction.isDebit()) {
        const balance = await this.ledgerRepository.getBalance(
          account.id,
          manager,
        );
        if (!transaction.isCoveredBy(balance)) {
          throw new UnprocessableEntityException('Insufficient funds');
        }
      }

      await this.transactionRepository.save(transaction, manager);

      await this.ledgerRepository.createEntries(
        [
          {
            accountId: account.id,
            transactionId: transaction.id,
            amount: transaction.amount,
          },
          {
            accountId: systemAccount.id,
            transactionId: transaction.id,
            amount: -transaction.amount,
          },
        ],
        manager,
      );

      transaction.complete();
      await this.transactionRepository.updateStatus(
        transaction.id,
        transaction.status,
        manager,
      );

      return transaction;
    });
  }
}
