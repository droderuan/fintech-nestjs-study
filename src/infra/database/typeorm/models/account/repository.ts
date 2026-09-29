import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../baseRepository';
import { AccountEntity } from './entity';

@Injectable()
export class AccountRepository extends BaseRepository<AccountEntity> {
  constructor(dataSource: DataSource) {
    super(dataSource, AccountEntity);
  }
}
