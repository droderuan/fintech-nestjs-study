import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../baseRepository';
import { TransactionTypeEntity } from '../transactionType/entity';
import { TransactionEntity } from './entity';

@Injectable()
export class TransactionRepository extends BaseRepository<TransactionEntity> {
  constructor(dataSource: DataSource) {
    super(dataSource, TransactionEntity);
  }

  findTypeByCode(code: string) {
    return this.dataSource
      .getRepository(TransactionTypeEntity)
      .findOne({ where: { code } });
  }

  async create(params: {
    accountId: string;
    transactionType: TransactionTypeEntity;
    amount: string;
  }) {
    const transaction = await this.repository.save(
      this.repository.create(params),
    );
    return { ...transaction, transactionType: params.transactionType };
  }
}
