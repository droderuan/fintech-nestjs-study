import {
  TransactionType,
  TransactionTypeEntity,
} from '../transactionType/entity';
import { TransactionEntity, TransactionStatus } from './entity';

const open = (code: TransactionType, amount: number) =>
  TransactionEntity.open({
    accountId: 'account-id',
    transactionType: { id: 1, code } as TransactionTypeEntity,
    amount,
  });

describe('TransactionEntity', () => {
  it.each([
    [TransactionType.PURCHASE, -5010, true],
    [TransactionType.PURCHASE_WITH_INSTALLMENTS, -5010, true],
    [TransactionType.WITHDRAW, -5010, true],
    [TransactionType.CREDIT_VOUCHER, 5010, false],
    [TransactionType.DEPOSIT, 5010, false],
  ])('should open %s with %s cents', (code, amount, isDebit) => {
    const transaction = open(code, 5010);

    expect(transaction.amount).toBe(amount);
    expect(transaction.isDebit()).toBe(isDebit);
    expect(transaction.status).toBe(TransactionStatus.PENDING);
    expect(transaction.transactionTypeId).toBe(1);
  });

  it('should be covered only by a balance at least as large as the debit', () => {
    const purchase = open(TransactionType.PURCHASE, 10000);

    expect(purchase.isCoveredBy(10000)).toBe(true);
    expect(purchase.isCoveredBy(9999)).toBe(false);
    expect(open(TransactionType.DEPOSIT, 10000).isCoveredBy(0)).toBe(true);
  });

  it('should complete', () => {
    const transaction = open(TransactionType.DEPOSIT, 1000);
    transaction.complete();

    expect(transaction.status).toBe(TransactionStatus.COMPLETED);
  });
});
