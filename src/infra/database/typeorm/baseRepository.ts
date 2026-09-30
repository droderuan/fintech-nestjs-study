import { Repository, DataSource, EntityManager, ObjectLiteral } from 'typeorm';

export abstract class BaseRepository<T extends ObjectLiteral> {
  protected repository: Repository<T>;

  constructor(
    protected readonly dataSource: DataSource,
    protected readonly entity: new () => T,
  ) {
    this.repository = this.dataSource.getRepository(entity);
  }

  protected repo(manager?: EntityManager): Repository<T> {
    return manager ? manager.getRepository(this.entity) : this.repository;
  }
}
