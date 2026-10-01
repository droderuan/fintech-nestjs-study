import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountEntity } from '../account/entity';
import {
  TransactionType,
  TransactionTypeEntity,
} from '../transactionType/entity';

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

// Purchases and withdrawals are registered with negative amounts.
const DEBIT_TYPES = new Set<string>([
  TransactionType.PURCHASE,
  TransactionType.PURCHASE_WITH_INSTALLMENTS,
  TransactionType.WITHDRAW,
]);

@Entity('transactions')
export class TransactionEntity {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuidv7()' })
  id: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ name: 'transaction_type_id', type: 'smallint' })
  transactionTypeId: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    enumName: 'transaction_status',
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  // Signed integer cents: negative debits, positive credits.
  @Column({ type: 'bigint' })
  amount: number;

  // Signed integer cents: sum of the customer's ledger entries for this transaction.
  @Column({ type: 'bigint', default: 0 })
  balance: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => AccountEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'account_id' })
  account?: AccountEntity;

  @ManyToOne(() => TransactionTypeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'transaction_type_id' })
  transactionType?: TransactionTypeEntity;

  // Builds a pending transaction, signing the amount (cents) by its type.
  static open(params: {
    accountId: string;
    transactionType: TransactionTypeEntity;
    amount: number;
  }): TransactionEntity & { transactionType: TransactionTypeEntity } {
    const transaction = new TransactionEntity();

    transaction.accountId = params.accountId;
    transaction.transactionType = params.transactionType;
    transaction.transactionTypeId = params.transactionType.id;
    transaction.status = TransactionStatus.PENDING;

    transaction.amount = DEBIT_TYPES.has(params.transactionType.code)
      ? -params.amount
      : params.amount;
    // The ledger pair written with the transaction posts the full amount.
    transaction.balance = transaction.amount;

    return transaction as TransactionEntity & {
      transactionType: TransactionTypeEntity;
    };
  }

  isDebit(): boolean {
    return this.amount < 0;
  }

  isCoveredBy(balance: number): boolean {
    return balance + this.amount >= 0;
  }

  complete(): void {
    this.status = TransactionStatus.COMPLETED;
  }
}
