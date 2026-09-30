import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../baseRepository';
import { AccountEntity, DocumentType } from './entity';

@Injectable()
export class AccountRepository extends BaseRepository<AccountEntity> {
  constructor(dataSource: DataSource) {
    super(dataSource, AccountEntity);
  }

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  findByDocument(documentType: DocumentType, document: string) {
    return this.repository.findOne({ where: { documentType, document } });
  }

  create(params: { document: string; documentType: DocumentType }) {
    return this.repository.save(this.repository.create(params));
  }
}
