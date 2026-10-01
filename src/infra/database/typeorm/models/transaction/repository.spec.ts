import { DataSource, EntityManager, LessThan } from 'typeorm';
import { TransactionEntity, TransactionStatus } from './entity';
import { TransactionRepository } from './repository';

describe('TransactionRepository', () => {
  let repo: {
    find: ReturnType<typeof vi.fn>;
    increment: ReturnType<typeof vi.fn>;
  };
  let manager: EntityManager;
  let repository: TransactionRepository;

  beforeEach(() => {
    repo = { find: vi.fn().mockResolvedValue([]), increment: vi.fn() };
    manager = {
      getRepository: vi.fn().mockReturnValue(repo),
    } as unknown as EntityManager;
    repository = new TransactionRepository({
      getRepository: vi.fn(),
    } as unknown as DataSource);
  });

  it('should find completed debits with a negative balance, oldest first', async () => {
    repo.find.mockResolvedValue([
      { id: 'purchase-1', balance: -1350 },
      { id: 'purchase-2', balance: -1870 },
    ]);

    const debits = await repository.findOutstandingDebits('account', manager);

    expect(manager.getRepository).toHaveBeenCalledWith(TransactionEntity);
    expect(repo.find).toHaveBeenCalledWith({
      select: { id: true, balance: true },
      where: {
        accountId: 'account',
        status: TransactionStatus.COMPLETED,
        balance: LessThan(0),
      },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
    expect(debits).toEqual([
      { transactionId: 'purchase-1', outstanding: 1350 },
      { transactionId: 'purchase-2', outstanding: 1870 },
    ]);
  });

  it('should increment the transaction balance', async () => {
    await repository.addToBalance('purchase-1', 650, manager);

    expect(repo.increment).toHaveBeenCalledWith(
      { id: 'purchase-1' },
      'balance',
      650,
    );
  });
});
