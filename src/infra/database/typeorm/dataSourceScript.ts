import '../../../env';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions, getDatabaseConfigFromEnv } from './dataSource';

// Used only by the TypeORM CLI (migrations).
export default new DataSource(
  buildDataSourceOptions(getDatabaseConfigFromEnv()),
);
