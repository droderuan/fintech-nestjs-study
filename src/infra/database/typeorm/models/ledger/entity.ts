import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ledger')
export class LedgerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
