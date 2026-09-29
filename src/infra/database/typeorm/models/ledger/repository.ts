import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../baseRepository';
import { LedgerEntity } from './entity';

@Injectable()
export class LedgerRepository extends BaseRepository<LedgerEntity> {
  constructor(dataSource: DataSource) {
    super(dataSource, LedgerEntity);
  }
}
