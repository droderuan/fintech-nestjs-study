import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  AccountEntity,
  AccountRepository,
  DocumentType,
} from '../../infra/database/typeorm/models';
import { AccountsService } from './accounts.service';

describe('AccountsService', () => {
  const account = {
    id: '0195f1a2-0000-7000-8000-000000000001',
    document: '12345678900',
    documentType: DocumentType.CPF,
  } as AccountEntity;

  let accountRepository: {
    findById: ReturnType<typeof vi.fn>;
    findByDocument: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let service: AccountsService;

  beforeEach(() => {
    accountRepository = {
      findById: vi.fn(),
      findByDocument: vi.fn(),
      create: vi.fn(),
    };
    service = new AccountsService(
      accountRepository as unknown as AccountRepository,
    );
  });

  describe('create', () => {
    it('should create an account for a new document', async () => {
      accountRepository.findByDocument.mockResolvedValue(null);
      accountRepository.create.mockResolvedValue(account);

      const result = await service.create({
        document: '12345678900',
        document_type: DocumentType.CPF,
      });

      expect(accountRepository.create).toHaveBeenCalledWith({
        document: '12345678900',
        documentType: DocumentType.CPF,
      });
      expect(result).toBe(account);
    });

    it('should reject a document that already has an account', async () => {
      accountRepository.findByDocument.mockResolvedValue(account);

      await expect(
        service.create({
          document: '12345678900',
          document_type: DocumentType.CPF,
        }),
      ).rejects.toThrow(ConflictException);
      expect(accountRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return the account', async () => {
      accountRepository.findById.mockResolvedValue(account);

      await expect(service.findById(account.id)).resolves.toBe(account);
    });

    it('should throw when the account does not exist', async () => {
      accountRepository.findById.mockResolvedValue(null);

      await expect(service.findById(account.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
