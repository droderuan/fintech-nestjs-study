import {
  AccountEntity,
  DocumentType,
} from '../../../infra/database/typeorm/models';

export class AccountResponseDto {
  /** @example 0199a0c4-7c1e-7b3a-9f2d-5e8c1a2b3c4d */
  account_id: string;

  /** @example 12345678900 */
  document: string;

  /** @example CPF */
  document_type: DocumentType;

  /**
   * Available amount in cents (sum of the account's ledger entries).
   * @example 10050
   */
  amount: number;

  static fromEntity(
    account: AccountEntity,
    amount: number,
  ): AccountResponseDto {
    return {
      account_id: account.id,
      document: account.document,
      document_type: account.documentType,
      amount,
    };
  }
}
