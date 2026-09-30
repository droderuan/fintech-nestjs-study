import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumnOptions,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

const uuidPrimaryKey: TableColumnOptions = {
  name: 'id',
  type: 'uuid',
  isPrimary: true,
  default: 'uuidv7()',
};

const createdAt: TableColumnOptions = {
  name: 'created_at',
  type: 'timestamptz',
  default: 'now()',
};

const updatedAt: TableColumnOptions = {
  name: 'updated_at',
  type: 'timestamptz',
  default: 'now()',
};

const deletedAt: TableColumnOptions = {
  name: 'deleted_at',
  type: 'timestamptz',
  isNullable: true,
};

// Integer cents: 12345 = 123.45.
const amount: TableColumnOptions = {
  name: 'amount',
  type: 'bigint',
};

const restrict = (
  columnName: string,
  referencedTableName: string,
): TableForeignKey =>
  new TableForeignKey({
    columnNames: [columnName],
    referencedTableName,
    referencedColumnNames: ['id'],
    onDelete: 'RESTRICT',
    onUpdate: 'NO ACTION',
  });

export class V1Schema1790720426282 implements MigrationInterface {
  name = 'V1Schema1790720426282';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'accounts',
        columns: [
          uuidPrimaryKey,
          { name: 'document', type: 'varchar', length: '32' },
          {
            name: 'document_type',
            type: 'enum',
            enum: ['CPF', 'PASSPORT', 'CNPJ'],
            enumName: 'document_type',
          },
          createdAt,
          updatedAt,
          deletedAt,
        ],
        indices: [
          new TableIndex({
            name: 'UQ_accounts_document_type_document',
            columnNames: ['document_type', 'document'],
            isUnique: true,
            where: '"deleted_at" IS NULL',
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'system_accounts',
        columns: [
          uuidPrimaryKey,
          { name: 'account_id', type: 'uuid' },
          { name: 'enabled', type: 'boolean', default: true },
          createdAt,
          updatedAt,
          deletedAt,
        ],
        indices: [
          new TableIndex({
            name: 'UQ_system_accounts_account_id',
            columnNames: ['account_id'],
            isUnique: true,
            where: '"deleted_at" IS NULL',
          }),
        ],
        foreignKeys: [restrict('account_id', 'accounts')],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'transaction_types',
        columns: [
          { name: 'id', type: 'smallint', isPrimary: true },
          { name: 'code', type: 'varchar', length: '32', isUnique: true },
          { name: 'display_code', type: 'varchar', length: '32' },
          {
            name: 'description',
            type: 'varchar',
            length: '128',
            isNullable: true,
          },
          createdAt,
          updatedAt,
          deletedAt,
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          uuidPrimaryKey,
          { name: 'account_id', type: 'uuid' },
          { name: 'transaction_type_id', type: 'smallint' },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'COMPLETED', 'CANCELED'],
            enumName: 'transaction_status',
            default: `'PENDING'`,
          },
          amount,
          createdAt,
          updatedAt,
        ],
        indices: [
          new TableIndex({
            name: 'IDX_transactions_account_id_created_at',
            columnNames: ['account_id', 'created_at'],
          }),
        ],
        foreignKeys: [
          restrict('account_id', 'accounts'),
          restrict('transaction_type_id', 'transaction_types'),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'ledgers',
        columns: [
          uuidPrimaryKey,
          { name: 'account_id', type: 'uuid' },
          { name: 'transaction_id', type: 'uuid' },
          amount,
          createdAt,
        ],
        indices: [
          new TableIndex({
            name: 'IDX_ledgers_account_id_created_at',
            columnNames: ['account_id', 'created_at'],
          }),
          new TableIndex({
            name: 'IDX_ledgers_transaction_id',
            columnNames: ['transaction_id'],
          }),
        ],
        foreignKeys: [
          restrict('account_id', 'accounts'),
          restrict('transaction_id', 'transactions'),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ledgers', true, true, true);
    await queryRunner.dropTable('transactions', true, true, true);
    await queryRunner.dropTable('transaction_types', true, true, true);
    await queryRunner.dropTable('system_accounts', true, true, true);
    await queryRunner.dropTable('accounts', true, true, true);
    await queryRunner.query(
      'DROP TYPE IF EXISTS "transaction_status", "document_type"',
    );
  }
}
