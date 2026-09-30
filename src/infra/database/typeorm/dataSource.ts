import 'reflect-metadata';
import { join } from 'node:path';
import { DataSource, DataSourceOptions } from 'typeorm';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  logging?: boolean;
}

export function getDatabaseConfigFromEnv(): DatabaseConfig {
  return {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'cdx',
    logging: process.env.DB_LOGGING === 'true',
  };
}

// Globs resolve from this file so they match .ts under ts-node (CLI)
// and .js once compiled to dist.
export function buildDataSourceOptions(
  config: DatabaseConfig,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    synchronize: false,
    // Return bigint (amounts in cents) as JS numbers instead of strings.
    parseInt8: true,
    logging: config.logging ?? false,
    entities: [join(__dirname, 'models/**/entity.{ts,js}')],
    migrations: [join(__dirname, 'migration/*.{ts,js}')],
    subscribers: [],
  };
}

export class AppDataSource {
  private static instance: DataSource;

  static initialize(config: DatabaseConfig): DataSource {
    if (!this.instance) {
      this.instance = new DataSource(buildDataSourceOptions(config));
    }

    return this.instance;
  }

  static getInstance(): DataSource {
    if (!this.instance) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.instance;
  }
}
