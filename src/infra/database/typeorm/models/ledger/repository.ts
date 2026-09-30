import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { BaseRepository } from '../../baseRepository';
import { LedgerEntity } from './entity';

@Injectable()
export class LedgerRepository extends BaseRepository<LedgerEntity> {
  constructor(dataSource: DataSource) {
    super(dataSource, LedgerEntity);
  }

  async getBalance(
    accountId: string,
    manager?: EntityManager,
  ): Promise<number> {
    const row = await this.repo(manager)
      .createQueryBuilder('ledger')
      .select('COALESCE(SUM(ledger.amount), 0)::bigint', 'balance')
      .where('ledger.accountId = :accountId', { accountId })
      .getRawOne<{ balance: number }>();
    return row?.balance ?? 0;
  }

  async createEntries(
    entries: {
      accountId: string;
      transactionId: string;
      amount: number;
    }[],
    manager?: EntityManager,
  ) {
    await this.repo(manager).insert(entries);
  }
}
