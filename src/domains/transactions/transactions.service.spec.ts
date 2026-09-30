import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import {
  AccountEntity,
  AccountRepository,
  LedgerRepository,
  TransactionEntity,
  TransactionRepository,
  TransactionStatus,
  TransactionType,
  TransactionTypeEntity,
} from '../../infra/database/typeorm/models';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  const account = { id: 'customer-account' } as AccountEntity;
  const systemAccount = { id: 'system-account' } as AccountEntity;
  const manager = {} as EntityManager;

  let dataSource: { transaction: ReturnType<typeof vi.fn> };
  let accountRepository: {
    findByIdForTransaction: ReturnType<typeof vi.fn>;
    findSystemAccount: ReturnType<typeof vi.fn>;
  };
  let transactionRepository: {
    findTypeByCode: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };
  let ledgerRepository: {
    getBalance: ReturnType<typeof vi.fn>;
    createEntries: ReturnType<typeof vi.fn>;
  };
  let service: TransactionsService;

  beforeEach(() => {
    dataSource = {
      transaction: vi.fn((work: (m: EntityManager) => unknown) =>
        work(manager),
      ),
    };
    accountRepository = {
      findByIdForTransaction: vi.fn().mockResolvedValue(account),
      findSystemAccount: vi.fn().mockResolvedValue(systemAccount),
    };
    transactionRepository = {
      findTypeByCode: vi.fn(
        async (code: string) => ({ id: 1, code }) as TransactionTypeEntity,
      ),
      save: vi.fn(async (transaction: TransactionEntity) =>
        Object.assign(transaction, { id: 'transaction-id' }),
      ),
      updateStatus: vi.fn(),
    };
    ledgerRepository = {
      getBalance: vi.fn().mockResolvedValue(10000),
      createEntries: vi.fn(),
    };
    service = new TransactionsService(
      dataSource as unknown as DataSource,
      accountRepository as unknown as AccountRepository,
      transactionRepository as unknown as TransactionRepository,
      ledgerRepository as unknown as LedgerRepository,
    );
  });

  // amount is in cents, as delivered by CreateTransactionDto.
  const create = (type: TransactionType, amount: number) =>
    service.create({ account_id: account.id, type, amount });

  it.each([
    [TransactionType.PURCHASE, -5010, 5010],
    [TransactionType.PURCHASE_WITH_INSTALLMENTS, -5010, 5010],
    [TransactionType.WITHDRAW, -5010, 5010],
    [TransactionType.CREDIT_VOUCHER, 5010, -5010],
    [TransactionType.DEPOSIT, 5010, -5010],
  ])(
    'should post %s as %s cents to the customer and %s to the system account',
    async (type, customerAmount, systemAmount) => {
      const result = await create(type, 5010);

      expect(transactionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: account.id,
          transactionTypeId: 1,
          amount: customerAmount,
        }),
        manager,
      );
      expect(ledgerRepository.createEntries).toHaveBeenCalledWith(
        [
          {
            accountId: account.id,
            transactionId: 'transaction-id',
            amount: customerAmount,
          },
          {
            accountId: systemAccount.id,
            transactionId: 'transaction-id',
            amount: systemAmount,
          },
        ],
        manager,
      );
      expect(transactionRepository.updateStatus).toHaveBeenCalledWith(
        'transaction-id',
        TransactionStatus.COMPLETED,
        manager,
      );
      expect(result.status).toBe(TransactionStatus.COMPLETED);
    },
  );

  it('should run everything in a single database transaction', async () => {
    await create(TransactionType.DEPOSIT, 1000);

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(accountRepository.findByIdForTransaction).toHaveBeenCalledWith(
      account.id,
      manager,
    );
  });

  it('should not check the balance for credits', async () => {
    await create(TransactionType.DEPOSIT, 1000);

    expect(ledgerRepository.getBalance).not.toHaveBeenCalled();
  });

  it('should allow a debit that uses the whole balance', async () => {
    await expect(
      create(TransactionType.PURCHASE, 10000),
    ).resolves.toMatchObject({
      status: TransactionStatus.COMPLETED,
    });
    expect(ledgerRepository.getBalance).toHaveBeenCalledWith(
      account.id,
      manager,
    );
  });

  it('should reject a debit larger than the balance', async () => {
    await expect(create(TransactionType.WITHDRAW, 10001)).rejects.toThrow(
      UnprocessableEntityException,
    );
    expect(transactionRepository.save).not.toHaveBeenCalled();
    expect(ledgerRepository.createEntries).not.toHaveBeenCalled();
  });

  it('should throw when the account does not exist', async () => {
    accountRepository.findByIdForTransaction.mockResolvedValue(null);

    await expect(create(TransactionType.DEPOSIT, 1000)).rejects.toThrow(
      NotFoundException,
    );
    expect(transactionRepository.save).not.toHaveBeenCalled();
  });

  it('should throw when no system account is configured', async () => {
    accountRepository.findSystemAccount.mockResolvedValue(null);

    await expect(create(TransactionType.DEPOSIT, 1000)).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should reject transactions on the system account itself', async () => {
    accountRepository.findByIdForTransaction.mockResolvedValue(systemAccount);

    await expect(create(TransactionType.DEPOSIT, 1000)).rejects.toThrow(
      BadRequestException,
    );
    expect(transactionRepository.save).not.toHaveBeenCalled();
  });

  it('should throw when the type code is not in the database', async () => {
    transactionRepository.findTypeByCode.mockResolvedValue(null);

    await expect(create(TransactionType.DEPOSIT, 1000)).rejects.toThrow(
      BadRequestException,
    );
    expect(transactionRepository.save).not.toHaveBeenCalled();
  });
});
