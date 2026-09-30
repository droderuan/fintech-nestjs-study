import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../baseRepository';
import { SystemAccountEntity } from './entity';

@Injectable()
export class SystemAccountRepository extends BaseRepository<SystemAccountEntity> {
  constructor(dataSource: DataSource) {
    super(dataSource, SystemAccountEntity);
  }
}
