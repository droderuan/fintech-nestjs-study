import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountRepository,
  LedgerRepository,
} from '../../infra/database/typeorm/models';
import { CreateAccountDto } from './dto/createAccount.dto';

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly ledgerRepository: LedgerRepository,
  ) {}

  async create({ document, document_type }: CreateAccountDto) {
    const existing = await this.accountRepository.findByDocument(
      document_type,
      document,
    );
    if (existing) {
      throw new ConflictException(
        'An account with this document already exists',
      );
    }

    return this.accountRepository.create({
      document,
      documentType: document_type,
    });
  }

  // Returns the account with its available amount (sum of its ledger entries).
  async findById(accountId: string) {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const amount = await this.ledgerRepository.getBalance(account.id);
    return { account, amount };
  }
}
