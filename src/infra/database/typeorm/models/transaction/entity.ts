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
import { TransactionTypeEntity } from '../transactionType/entity';

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

@Entity('transactions')
@Index('IDX_transactions_account_id_created_at', ['accountId', 'createdAt'])
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

  // numeric comes back from pg as string to avoid float precision loss.
  @Column({ type: 'numeric', precision: 15, scale: 2 })
  amount: string;

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
}
