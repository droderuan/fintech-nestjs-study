import {
  AccountEntity,
  DocumentType,
} from '../../../infra/database/typeorm/models';

export class AccountResponseDto {
  account_id: string;
  document: string;
  document_type: DocumentType;

  static fromEntity(account: AccountEntity): AccountResponseDto {
    return {
      account_id: account.id,
      document: account.document,
      document_type: account.documentType,
    };
  }
}
