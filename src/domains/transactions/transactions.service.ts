import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import {
  AccountRepository,
  LedgerRepository,
  TransactionRepository,
  TransactionEntity,
} from '../../infra/database/typeorm/models';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { DischargeTransactionDto } from './dto/dischargeTransaction.dto';

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
      const { account, systemAccount } = await this.resolveAccounts(
        account_id,
        manager,
      );

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

  // Pays the account's card bill: discharges outstanding debits from oldest
  // to newest until the amount runs out. Each discharge posts a pair on the
  // debit itself (customer +x, system -x) and adds x to the debit's balance,
  // so no new transaction is created.
  // Any amount beyond what is outstanding is not applied.
  transactionDischarge({ account_id, amount }: DischargeTransactionDto) {
    return this.dataSource.transaction(async (manager) => {
      const { account, systemAccount } = await this.resolveAccounts(
        account_id,
        manager,
      );

      const debits = await this.transactionRepository.findOutstandingDebits(
        account.id,
        manager,
      );

      const discharged: { transactionId: string; amount: number }[] = [];
      let remainingAmount = amount;

      for (const debit of debits) {
        if (remainingAmount === 0) break;

        const paid = Math.min(remainingAmount, debit.outstanding);
        discharged.push({ transactionId: debit.transactionId, amount: paid });
        remainingAmount -= paid;
      }

      if (discharged.length > 0) {
        await this.ledgerRepository.createEntries(
          discharged.flatMap(({ transactionId, amount: paid }) => [
            { accountId: account.id, transactionId, amount: paid },
            { accountId: systemAccount.id, transactionId, amount: -paid },
          ]),
          manager,
        );

        for (const { transactionId, amount: paid } of discharged) {
          await this.transactionRepository.addToBalance(
            transactionId,
            paid,
            manager,
          );
        }
      }

      return { accountId: account.id, amount, remainingAmount, discharged };
    });
  }

  private async resolveAccounts(accountId: string, manager: EntityManager) {
    const account = await this.accountRepository.findByIdForTransaction(
      accountId,
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

    return { account, systemAccount };
  }
}
