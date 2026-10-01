import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, LessThan } from 'typeorm';
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

  // Completed debits of the account that still have an unpaid part, oldest
  // first. A debit's outstanding amount is its negated balance; discharges
  // settle it by posting credits against it.
  async findOutstandingDebits(
    accountId: string,
    manager?: EntityManager,
  ): Promise<{ transactionId: string; outstanding: number }[]> {
    const debits = await this.repo(manager).find({
      select: { id: true, balance: true },
      where: {
        accountId,
        status: TransactionStatus.COMPLETED,
        balance: LessThan(0),
      },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
    return debits.map(({ id, balance }) => ({
      transactionId: id,
      outstanding: -balance,
    }));
  }

  async addToBalance(id: string, amount: number, manager?: EntityManager) {
    await this.repo(manager).increment({ id }, 'balance', amount);
  }
}
