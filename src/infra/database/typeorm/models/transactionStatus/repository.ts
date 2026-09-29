import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../baseRepository';
import { TransactionStatusEntity } from './entity';

@Injectable()
export class TransactionStatusRepository extends BaseRepository<TransactionStatusEntity> {
  constructor(dataSource: DataSource) {
    super(dataSource, TransactionStatusEntity);
  }
}
