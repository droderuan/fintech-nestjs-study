import { Repository, DataSource, ObjectLiteral } from 'typeorm';

export abstract class BaseRepository<T extends ObjectLiteral> {
  protected repository: Repository<T>;

  constructor(
    protected readonly dataSource: DataSource,
    protected readonly entity: new () => T,
  ) {
    this.repository = this.dataSource.getRepository(entity);
  }
}
