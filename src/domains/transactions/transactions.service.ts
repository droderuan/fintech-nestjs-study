import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountRepository,
  TransactionRepository,
  TransactionType,
} from '../../infra/database/typeorm/models';
import { CreateTransactionDto } from './dto/createTransaction.dto';

// Purchases and withdrawals are registered with negative amounts.
const DEBIT_TYPES = new Set<TransactionType>([
  TransactionType.PURCHASE,
  TransactionType.PURCHASE_WITH_INSTALLMENTS,
  TransactionType.WITHDRAW,
]);

@Injectable()
export class TransactionsService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async create({ account_id, type, amount }: CreateTransactionDto) {
    const account = await this.accountRepository.findById(account_id);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const transactionType =
      await this.transactionRepository.findTypeByCode(type);
    if (!transactionType) {
      throw new BadRequestException(`Unknown transaction type: ${type}`);
    }

    const signedAmount = DEBIT_TYPES.has(type) ? -amount : amount;

    return this.transactionRepository.create({
      accountId: account_id,
      transactionType,
      amount: signedAmount.toFixed(2),
    });
  }
}
