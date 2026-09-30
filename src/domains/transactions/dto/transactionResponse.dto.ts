import {
  TransactionEntity,
  TransactionStatus,
  TransactionTypeEntity,
} from '../../../infra/database/typeorm/models';

export class TransactionResponseDto {
  transaction_id: string;
  account_id: string;
  type: string;
  amount: number;
  status: TransactionStatus;
  event_date: Date;

  static fromEntity(
    transaction: TransactionEntity & { transactionType: TransactionTypeEntity },
  ): TransactionResponseDto {
    return {
      transaction_id: transaction.id,
      account_id: transaction.accountId,
      type: transaction.transactionType.code,
      amount: Number(transaction.amount),
      status: transaction.status,
      event_date: transaction.createdAt,
    };
  }
}
