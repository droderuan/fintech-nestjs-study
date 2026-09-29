import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('transaction_statuses')
export class TransactionStatusEntity {
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
