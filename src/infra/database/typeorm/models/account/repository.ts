import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { BaseRepository } from '../../baseRepository';
import { SystemAccountEntity } from '../systemAccount/entity';
import { AccountEntity, DocumentType } from './entity';

@Injectable()
export class AccountRepository extends BaseRepository<AccountEntity> {
  constructor(dataSource: DataSource) {
    super(dataSource, AccountEntity);
  }

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  // Row lock: serializes balance checks and discharges on the same account.
  findByIdForTransaction(id: string, manager: EntityManager) {
    return this.repo(manager).findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }

  findByDocument(documentType: DocumentType, document: string) {
    return this.repository.findOne({ where: { documentType, document } });
  }

  findSystemAccount(manager?: EntityManager) {
    return this.repo(manager)
      .createQueryBuilder('account')
      .innerJoin(SystemAccountEntity, 'system', 'system.accountId = account.id')
      .where('system.enabled = true')
      .andWhere('system.deletedAt IS NULL')
      .orderBy('system.createdAt', 'ASC')
      .getOne();
  }

  create(params: { document: string; documentType: DocumentType }) {
    return this.repository.save(this.repository.create(params));
  }
}
