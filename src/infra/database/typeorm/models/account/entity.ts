import {
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
  CNPJ = 'CNPJ',
}

@Entity('accounts')
export class AccountEntity {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuidv7()' })
  id: string;

  @Column({ length: 32 })
  document: string;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: DocumentType,
    enumName: 'document_type',
  })
  documentType: DocumentType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
