import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  AccountEntity,
  AccountRepository,
  TransactionEntity,
  TransactionRepository,
  TransactionType,
  TransactionTypeEntity,
} from '../../infra/database/typeorm/models';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  const accountId = '0195f1a2-0000-7000-8000-000000000001';

  let accountRepository: { findById: ReturnType<typeof vi.fn> };
  let transactionRepository: {
    findTypeByCode: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let service: TransactionsService;

  beforeEach(() => {
    accountRepository = {
      findById: vi.fn().mockResolvedValue({ id: accountId } as AccountEntity),
    };
    transactionRepository = {
      findTypeByCode: vi.fn(
        async (code: string) => ({ id: 1, code }) as TransactionTypeEntity,
      ),
      create: vi.fn().mockResolvedValue({} as TransactionEntity),
    };
    service = new TransactionsService(
      accountRepository as unknown as AccountRepository,
      transactionRepository as unknown as TransactionRepository,
    );
  });

  it.each([
    [TransactionType.PURCHASE, '-50.10'],
    [TransactionType.PURCHASE_WITH_INSTALLMENTS, '-50.10'],
    [TransactionType.WITHDRAW, '-50.10'],
    [TransactionType.CREDIT_VOUCHER, '50.10'],
    [TransactionType.DEPOSIT, '50.10'],
  ])('should store type %s with amount %s', async (type, expectedAmount) => {
    await service.create({ account_id: accountId, type, amount: 50.1 });

    expect(transactionRepository.findTypeByCode).toHaveBeenCalledWith(type);
    expect(transactionRepository.create).toHaveBeenCalledWith({
      accountId,
      transactionType: { id: 1, code: type },
      amount: expectedAmount,
    });
  });

  it('should throw when the account does not exist', async () => {
    accountRepository.findById.mockResolvedValue(null);

    await expect(
      service.create({
        account_id: accountId,
        type: TransactionType.CREDIT_VOUCHER,
        amount: 10,
      }),
    ).rejects.toThrow(NotFoundException);
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('should throw when the type code is not in the database', async () => {
    transactionRepository.findTypeByCode.mockResolvedValue(null);

    await expect(
      service.create({
        account_id: accountId,
        type: TransactionType.DEPOSIT,
        amount: 10,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });
});
