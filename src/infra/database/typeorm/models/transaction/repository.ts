import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { BaseRepository } from '../../baseRepository';
import { TransactionTypeEntity } from '../transactionType/entity';
import { TransactionEntity, TransactionStatus } from './entity';

@Injectable()
export class TransactionRepository extends BaseRepository<TransactionEntity> {
  constructor(dataSource: DataSource) {
    super(dataSource, TransactionEntity);
  }

  findTypeByCode(code: string, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(TransactionTypeEntity)
      : this.dataSource.getRepository(TransactionTypeEntity);
    return repository.findOne({ where: { code } });
  }

  save(transaction: TransactionEntity, manager?: EntityManager) {
    return this.repo(manager).save(transaction);
  }

  async updateStatus(
    id: string,
    status: TransactionStatus,
    manager?: EntityManager,
  ) {
    await this.repo(manager).update({ id }, { status });
  }
}
