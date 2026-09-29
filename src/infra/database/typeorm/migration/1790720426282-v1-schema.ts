import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableCheck,
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

const amount: TableColumnOptions = {
  name: 'amount',
  type: 'numeric',
  precision: 15,
  scale: 2,
};

const lookupTable = (name: string) =>
  new Table({
    name,
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
  });

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
          { name: 'document_type', type: 'varchar', length: '16' },
          createdAt,
          updatedAt,
          deletedAt,
        ],
        checks: [
          new TableCheck({
            name: 'CHK_accounts_document_type',
            expression: `"document_type" IN ('CPF', 'PASSPORT')`,
          }),
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

    await queryRunner.createTable(lookupTable('transaction_types'));
    await queryRunner.createTable(lookupTable('transaction_statuses'));

    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          uuidPrimaryKey,
          { name: 'account_id', type: 'uuid' },
          { name: 'transaction_type_id', type: 'smallint' },
          { name: 'transaction_status_id', type: 'smallint' },
          amount,
          createdAt,
          updatedAt,
        ],
        checks: [
          new TableCheck({
            name: 'CHK_transactions_amount',
            expression: '"amount" <> 0',
          }),
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
          restrict('transaction_status_id', 'transaction_statuses'),
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
        checks: [
          new TableCheck({
            name: 'CHK_ledgers_amount',
            expression: '"amount" <> 0',
          }),
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
    await queryRunner.dropTable('transaction_statuses', true, true, true);
    await queryRunner.dropTable('transaction_types', true, true, true);
    await queryRunner.dropTable('accounts', true, true, true);
  }
}
