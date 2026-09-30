import {
  TransactionEntity,
  TransactionStatus,
  TransactionTypeEntity,
} from '../../../infra/database/typeorm/models';

export class TransactionResponseDto {
  /** @example 0199a0c5-1d2e-7f3a-8b4c-6d7e8f9a0b1c */
  transaction_id: string;

  /** @example 00000000-0000-7000-8000-000000000002 */
  account_id: string;

  /**
   * Transaction type code.
   * @example purchase
   */
  type: string;

  /**
   * Signed integer cents: negative for debits, positive for credits.
   * @example -10050
   */
  amount: number;

  /** @example COMPLETED */
  status: TransactionStatus;

  event_date: Date;

  static fromEntity(
    transaction: TransactionEntity & { transactionType: TransactionTypeEntity },
  ): TransactionResponseDto {
    return {
      transaction_id: transaction.id,
      account_id: transaction.accountId,
      type: transaction.transactionType.code,
      amount: transaction.amount,
      status: transaction.status,
      event_date: transaction.createdAt,
    };
  }
}
