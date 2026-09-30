import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

// Mirrors the seeded transaction_types codes. The API refers to types by
// code; ids are resolved from the table.
export enum TransactionType {
  PURCHASE = 'purchase',
  PURCHASE_WITH_INSTALLMENTS = 'purchase_with_installments',
  WITHDRAW = 'withdraw',
  CREDIT_VOUCHER = 'credit_voucher',
  DEPOSIT = 'deposit',
}

@Entity('transaction_types')
export class TransactionTypeEntity {
  @PrimaryColumn({ type: 'smallint' })
  id: number;

  @Column({ length: 32, unique: true })
  code: string;

  @Column({ name: 'display_code', length: 32 })
  displayCode: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
