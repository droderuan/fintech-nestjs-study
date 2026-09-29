import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DocumentType {
  CPF = 'CPF',
  PASSPORT = 'PASSPORT',
}

@Entity('accounts')
@Check('CHK_accounts_document_type', `"document_type" IN ('CPF', 'PASSPORT')`)
@Index('UQ_accounts_document_type_document', ['documentType', 'document'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class AccountEntity {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuidv7()' })
  id: string;

  @Column({ length: 32 })
  document: string;

  @Column({ name: 'document_type', type: 'varchar', length: 16 })
  documentType: DocumentType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
