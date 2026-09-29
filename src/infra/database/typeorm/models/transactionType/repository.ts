import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../baseRepository';
import { TransactionTypeEntity } from './entity';

@Injectable()
export class TransactionTypeRepository extends BaseRepository<TransactionTypeEntity> {
  constructor(dataSource: DataSource) {
    super(dataSource, TransactionTypeEntity);
  }
}
