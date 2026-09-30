import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { AccountEntity } from '../account/entity';
import { TransactionEntity } from '../transaction/entity';

// Append-only: rows are never updated or deleted.
@Entity('ledgers')
@Index('IDX_ledgers_account_id_created_at', ['accountId', 'createdAt'])
@Index('IDX_ledgers_transaction_id', ['transactionId'])
export class LedgerEntity {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuidv7()' })
  id: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ name: 'transaction_id', type: 'uuid' })
  transactionId: string;

  // Signed: negative debits, positive credits.
  @Column({ type: 'numeric', precision: 15, scale: 2 })
  amount: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => AccountEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'account_id' })
  account?: AccountEntity;

  @ManyToOne(() => TransactionEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'transaction_id' })
  transaction?: TransactionEntity;
}
