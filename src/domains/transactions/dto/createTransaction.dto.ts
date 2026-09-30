import { IsEnum, IsInt, IsPositive, IsUUID, Max } from 'class-validator';
import { TransactionType } from '../../../infra/database/typeorm/models';

export class CreateTransactionDto {
  /** @example 00000000-0000-7000-8000-000000000002 */
  @IsUUID()
  account_id: string;

  /** @example deposit */
  @IsEnum(TransactionType)
  type: TransactionType;

  /**
   * Positive integer cents. The sign is derived from the type.
   * @example 10050
   */
  @IsInt()
  @IsPositive()
  @Max(999_999_999_999_999)
  amount: number;
}
