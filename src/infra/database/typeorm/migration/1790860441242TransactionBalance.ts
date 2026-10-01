import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class TransactionBalance1790860441242 implements MigrationInterface {
  name = 'TransactionBalance1790860441242';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Signed integer cents: sum of the customer's ledger entries for the transaction.
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({ name: 'balance', type: 'bigint', default: 0 }),
    );

    // Backfill from the ledger. The system account's side is left out, since
    // both entries of a pair would cancel out.
    await queryRunner.query(`
      UPDATE "transactions" t
      SET "balance" = l."balance"
      FROM (
        SELECT l."transaction_id", l."account_id", SUM(l."amount") AS "balance"
        FROM "ledgers" l
        GROUP BY l."transaction_id", l."account_id"
      ) l
      WHERE l."transaction_id" = t."id"
        AND l."account_id" = t."account_id"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('transactions', 'balance');
  }
}
